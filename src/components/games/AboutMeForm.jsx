import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { appColors } from '../../utils/colors';
import { supabase } from '../../utils/supabase';
import { sendActivityNotification } from '../../utils/notifications';
import { ABOUT_QUESTIONS, aboutForDay } from '../../utils/games';
import { dayNumber } from '../../utils/questions';
import { gameStyles } from './gameStyles';

const SPARKLE = '✦';

const displayName = (user) => (user === 'salo' ? 'Salo' : 'Tao');

export default function AboutMeForm({ currentUser, onDone }) {
  const todayQuestions = aboutForDay(dayNumber(new Date()));
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('about_me')
          .select('question_id, answer')
          .eq('user_id', currentUser);

        if (error) throw error;
        const answers = Object.fromEntries((data || []).map(a => [a.question_id, a.answer]));
        setValues(answers);
        setSaved(answers);
      } catch (error) {
        console.error('Error cargando "Sobre mí":', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  // Las de hoy más las que ya respondí otros días, para poder corregirlas
  const earlierQuestions = ABOUT_QUESTIONS.filter(q => saved[q.id] && !todayQuestions.includes(q));
  const shown = [...todayQuestions, ...earlierQuestions];

  const save = async () => {
    setSaving(true);
    Keyboard.dismiss();
    try {
      const filled = shown.filter(q => values[q.id]?.trim());
      const empty = shown.filter(q => !values[q.id]?.trim() && saved[q.id]).map(q => q.id);

      if (filled.length > 0) {
        const { error } = await supabase.from('about_me')
          .upsert(filled.map(q => ({
            user_id: currentUser,
            question_id: q.id,
            answer: values[q.id].trim(),
            updated_at: new Date().toISOString(),
          })), { onConflict: 'user_id,question_id' });
        if (error) throw error;
      }

      if (empty.length > 0) {
        const { error } = await supabase.from('about_me')
          .delete()
          .eq('user_id', currentUser)
          .in('question_id', empty);
        if (error) throw error;
      }

      const wasNew = todayQuestions.some(q => !saved[q.id] && values[q.id]?.trim());
      if (wasNew) {
        await sendActivityNotification(
          currentUser,
          'quiz',
          `${displayName(currentUser)} respondió preguntas nuevas de su "Sobre mí", ¡ya puedes jugar el quiz!`
        );
      }

      onDone();
    } catch (error) {
      console.error('Error guardando "Sobre mí":', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={appColors.primary} />;
  }

  const renderInput = (q) => (
    <View key={q.id}>
      <Text style={gameStyles.label}>{q.ask}</Text>
      <TextInput
        style={gameStyles.input}
        value={values[q.id] || ''}
        onChangeText={(text) => setValues({ ...values, [q.id]: text })}
        placeholder="Tu respuesta..."
        placeholderTextColor={appColors.textLight}
        maxLength={120}
      />
    </View>
  );

  const todayDone = todayQuestions.filter(q => values[q.id]?.trim()).length;

  return (
    <View style={gameStyles.card}>
      <Text style={gameStyles.heading}>{SPARKLE} Preguntas de hoy ({todayDone}/{todayQuestions.length})</Text>
      <Text style={[gameStyles.muted, { marginBottom: 16 }]}>
        Cada día salen {todayQuestions.length} nuevas. Con tus respuestas se arma el quiz para que te adivinen.
      </Text>

      {todayQuestions.map(renderInput)}

      {earlierQuestions.length > 0 && (
        <>
          <Text style={[gameStyles.heading, { marginTop: 8 }]}>Respondidas antes ({earlierQuestions.length})</Text>
          {earlierQuestions.map(renderInput)}
        </>
      )}

      <TouchableOpacity
        style={[gameStyles.button, saving && gameStyles.buttonDisabled]}
        onPress={save}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="white" /> : <Text style={gameStyles.buttonText}>Guardar</Text>}
      </TouchableOpacity>
    </View>
  );
}
