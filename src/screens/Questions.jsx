import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  ImageBackground, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appColors } from '../utils/colors';
import { supabase } from '../utils/supabase';
import { sendActivityNotification } from '../utils/notifications';
import { dateKey, questionForDate } from '../utils/questions';
import { fonts } from '../utils/fonts';

const HEART = '♡';
const SPARKLE = '✦';

const displayName = (user) => (user === 'salo' ? 'Salo' : 'Tao');

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const formatDateKey = (key) => {
  const [, month, day] = key.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]}`;
};

export default function QuestionsScreen({ currentUser }) {
  const insets = useSafeAreaInsets();
  const otherUser = currentUser === 'salo' ? 'tao' : 'salo';
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedDates, setSavedDates] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  const today = dateKey();
  const todayQuestion = questionForDate();

  const loadAnswers = async () => {
    try {
      const { data, error } = await supabase.from('daily_answers')
        .select('*')
        .order('question_date', { ascending: false });

      if (error) throw error;
      setAnswers(data || []);
    } catch (error) {
      console.error('Error cargando respuestas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSaved = async () => {
    try {
      const { data, error } = await supabase.from('saved_questions')
        .select('question_date')
        .eq('user_id', currentUser);

      if (error) throw error;
      setSavedDates((data || []).map(s => s.question_date));
    } catch (error) {
      console.error('Error cargando preguntas guardadas:', error);
    }
  };

  const toggleSaved = async (date) => {
    const wasSaved = savedDates.includes(date);
    setSavedDates(wasSaved ? savedDates.filter(d => d !== date) : [...savedDates, date]);
    try {
      const { error } = wasSaved
        ? await supabase.from('saved_questions').delete().eq('user_id', currentUser).eq('question_date', date)
        : await supabase.from('saved_questions').insert([{ user_id: currentUser, question_date: date }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error guardando pregunta:', error);
      loadSaved();
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSaved();
      loadAnswers();
      const interval = setInterval(loadAnswers, 15000);
      return () => clearInterval(interval);
    }, [])
  );

  const answerFor = (date, user) => answers.find(a => a.question_date === date && a.user_id === user);

  const myAnswer = answerFor(today, currentUser);
  const partnerAnswer = answerFor(today, otherUser);

  // Solo se muestran los días que yo respondí, así nunca se ve la respuesta del otro antes de tiempo
  const pastDays = answers
    .filter(a => a.user_id === currentUser && a.question_date !== today)
    .map(a => ({ mine: a, theirs: answerFor(a.question_date, otherUser) }));

  // Solo se pueden guardar las preguntas que respondieron los dos
  const savedDays = answers
    .filter(a => a.user_id === currentUser && savedDates.includes(a.question_date))
    .map(a => ({ mine: a, theirs: answerFor(a.question_date, otherUser) }))
    .filter(day => day.theirs);

  const submitAnswer = async () => {
    const text = draft.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    Keyboard.dismiss();
    try {
      const { data, error } = await supabase.from('daily_answers')
        .insert([{
          question_date: today,
          question: todayQuestion,
          user_id: currentUser,
          answer: text,
        }])
        .select();

      if (error) throw error;

      setAnswers([...data, ...answers]);
      setDraft('');

      const message = partnerAnswer
        ? `${displayName(currentUser)} respondió la pregunta de hoy, ya pueden ver sus respuestas ${HEART}`
        : `${displayName(currentUser)} respondió la pregunta de hoy, responde para ver su respuesta`;
      await sendActivityNotification(currentUser, 'daily_answer', message, { question_date: today });
    } catch (error) {
      console.error('Error guardando respuesta:', error);
      loadAnswers();
    } finally {
      setSubmitting(false);
    }
  };

  const renderAnswer = (answer, user) => (
    <View style={[styles.answerBubble, user === 'salo' ? styles.saloBubble : styles.taoBubble]}>
      <Text style={styles.answerAuthor}>{displayName(user)}</Text>
      <Text style={styles.answerText}>{answer}</Text>
    </View>
  );

  const renderSaveButton = (date) => {
    const saved = savedDates.includes(date);
    return (
      <TouchableOpacity style={styles.saveButton} onPress={() => toggleSaved(date)} hitSlop={10}>
        <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={appColors.pink} />
        <Text style={styles.saveText}>{saved ? 'Guardada' : 'Guardar'}</Text>
      </TouchableOpacity>
    );
  };

  const renderDayCard = ({ mine, theirs }) => (
    <View key={mine.id} style={styles.pastCard}>
      <View style={styles.pastHeader}>
        <Text style={styles.pastDate}>
          {mine.question_date === today ? 'Hoy' : formatDateKey(mine.question_date)}
        </Text>
        {theirs && renderSaveButton(mine.question_date)}
      </View>
      <Text style={styles.pastQuestion}>{mine.question}</Text>
      {renderAnswer(mine.answer, currentUser)}
      {theirs
        ? renderAnswer(theirs.answer, otherUser)
        : <Text style={styles.waitingText}>{displayName(otherUser)} no respondió</Text>}
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/fondos/naranjasFondo.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Pregunta del día</Text>

          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>{SPARKLE} Hoy {SPARKLE}</Text>
            <Text style={styles.questionText}>{todayQuestion}</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={appColors.primary} style={styles.loader} />
          ) : myAnswer ? (
            <View style={styles.answersCard}>
              {renderAnswer(myAnswer.answer, currentUser)}
              {partnerAnswer ? (
                <>
                  {renderAnswer(partnerAnswer.answer, otherUser)}
                  <View style={styles.todaySave}>{renderSaveButton(today)}</View>
                </>
              ) : (
                <Text style={styles.waitingText}>
                  {displayName(otherUser)} aún no responde {HEART}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.answersCard}>
              <Text style={styles.partnerStatus}>
                {partnerAnswer
                  ? `${displayName(otherUser)} ya respondió ${SPARKLE} responde para ver su respuesta`
                  : `${displayName(otherUser)} aún no responde, ¡responde tú primero!`}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu respuesta..."
                placeholderTextColor={appColors.textLight}
                value={draft}
                onChangeText={setDraft}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[styles.submitButton, (!draft.trim() || submitting) && styles.submitDisabled]}
                onPress={submitAnswer}
                disabled={!draft.trim() || submitting}
              >
                {submitting
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.submitText}>Responder</Text>}
              </TouchableOpacity>
            </View>
          )}

          {(pastDays.length > 0 || savedDays.length > 0) && (
            <>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[styles.filterChip, !showSaved && styles.filterChipActive]}
                  onPress={() => setShowSaved(false)}
                >
                  <Text style={[styles.filterText, !showSaved && styles.filterTextActive]}>Anteriores</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, showSaved && styles.filterChipActive]}
                  onPress={() => setShowSaved(true)}
                >
                  <Text style={[styles.filterText, showSaved && styles.filterTextActive]}>
                    Guardadas {HEART} {savedDays.length}
                  </Text>
                </TouchableOpacity>
              </View>

              {showSaved
                ? savedDays.length > 0
                  ? savedDays.map(renderDayCard)
                  : <Text style={styles.waitingText}>Aún no has guardado preguntas {HEART}</Text>
                : pastDays.length > 0
                  ? pastDays.map(renderDayCard)
                  : <Text style={styles.waitingText}>Aún no hay preguntas anteriores</Text>}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: appColors.primary,
    textAlign: 'center',
    marginVertical: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  questionCard: {
    width: '100%',
    backgroundColor: '#FFF0F0',
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#F5A9A9',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 40,
    transform: [{ rotate: '-0.6deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  questionLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#D96C6C',
    textAlign: 'center',
    marginBottom: 8,
  },
  questionText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: appColors.text,
    textAlign: 'center',
    lineHeight: 30,
  },
  loader: {
    marginTop: 20,
  },
  answersCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: appColors.secondary,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  partnerStatus: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: appColors.textLight,
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: appColors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: appColors.cream,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: appColors.pinkLight,
    padding: 12,
    marginBottom: 14,
  },
  submitButton: {
    backgroundColor: appColors.pink,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontFamily: fonts.bold,
    color: 'white',
    fontSize: 18,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  answerBubble: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  saloBubble: {
    backgroundColor: 'rgba(240, 138, 138, 0.15)',
    borderColor: 'rgba(240, 138, 138, 0.5)',
  },
  taoBubble: {
    backgroundColor: 'rgba(124, 143, 214, 0.15)',
    borderColor: 'rgba(124, 143, 214, 0.5)',
  },
  answerAuthor: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: appColors.accent,
    marginBottom: 4,
  },
  answerText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: appColors.text,
    lineHeight: 22,
  },
  waitingText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: appColors.textLight,
    textAlign: 'center',
    marginVertical: 6,
  },
  filterRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginBottom: 14,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: appColors.secondary,
  },
  filterChipActive: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  filterText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: appColors.primary,
  },
  filterTextActive: {
    color: 'white',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: appColors.pink,
    marginLeft: 4,
  },
  todaySave: {
    alignItems: 'flex-end',
  },
  pastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pastCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appColors.pinkLight,
    marginBottom: 14,
  },
  pastDate: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: appColors.textLight,
  },
  pastQuestion: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: appColors.text,
    marginBottom: 10,
  },
});
