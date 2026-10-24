import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { appColors } from '../../utils/colors';
import { supabase } from '../../utils/supabase';
import { sendActivityNotification } from '../../utils/notifications';
import {
  ABOUT_QUESTIONS, QUIZ_LENGTH, QUIZ_MIN_ANSWERS, buildOptions, isSameAnswer, scoreLabel, shuffle
} from '../../utils/games';
import { gameStyles } from './gameStyles';

const displayName = (user) => (user === 'salo' ? 'Salo' : 'Tao');

export default function QuizGame({ currentUser, onDone }) {
  const otherUser = currentUser === 'salo' ? 'tao' : 'salo';
  const partnerName = displayName(otherUser);

  const [partnerAnswers, setPartnerAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('setup');
  const [mode, setMode] = useState(null);
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [draft, setDraft] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('about_me')
          .select('question_id, answer')
          .eq('user_id', otherUser);

        if (error) throw error;
        setPartnerAnswers((data || []).filter(a => ABOUT_QUESTIONS.some(q => q.id === a.question_id)));
      } catch (error) {
        console.error('Error cargando respuestas para el quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [otherUser]);

  const start = (selectedMode) => {
    const picks = shuffle(partnerAnswers).slice(0, QUIZ_LENGTH).map(a => {
      const question = ABOUT_QUESTIONS.find(q => q.id === a.question_id);
      return {
        question_id: a.question_id,
        question: question.quiz(partnerName),
        real: a.answer,
        options: selectedMode === 'choice' ? buildOptions(a.question_id, a.answer) : null,
      };
    });
    setMode(selectedMode);
    setItems(picks);
    setIndex(0);
    setGuesses([]);
    setPicked(null);
    setDraft('');
    setPhase('playing');
  };

  const finish = async (allGuesses) => {
    setSaving(true);
    const total = allGuesses.length;
    const score = mode === 'choice' ? allGuesses.filter(g => g.correct).length : null;

    try {
      const { error } = await supabase.from('quiz_games').insert([{
        player: currentUser,
        about_user: otherUser,
        mode,
        status: mode === 'choice' ? 'done' : 'pending_review',
        answers: allGuesses,
        score,
        total,
      }]);
      if (error) throw error;

      const message = mode === 'choice'
        ? `${displayName(currentUser)} jugó ¿Qué tanto me conoces? y sacó ${score}/${total}`
        : `${displayName(currentUser)} jugó ¿Qué tanto me conoces?, revisa sus respuestas`;
      await sendActivityNotification(currentUser, 'quiz', message);
    } catch (error) {
      console.error('Error guardando el quiz:', error);
    } finally {
      setSaving(false);
      setPhase('finished');
    }
  };

  const next = (guess) => {
    const item = items[index];
    const entry = {
      question_id: item.question_id,
      question: item.question,
      real: item.real,
      guess,
      correct: mode === 'choice' ? isSameAnswer(guess, item.real) : null,
    };
    const allGuesses = [...guesses, entry];
    setGuesses(allGuesses);
    setPicked(null);
    setDraft('');

    if (index + 1 < items.length) {
      setIndex(index + 1);
    } else {
      Keyboard.dismiss();
      finish(allGuesses);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={appColors.primary} />;
  }

  if (phase === 'setup') {
    const enough = partnerAnswers.length >= QUIZ_MIN_ANSWERS;
    return (
      <View style={gameStyles.card}>
        <Text style={gameStyles.heading}>¿Qué tanto conoces a {partnerName}?</Text>
        {enough ? (
          <>
            <Text style={[gameStyles.muted, { marginBottom: 16 }]}>
              {Math.min(partnerAnswers.length, QUIZ_LENGTH)} preguntas sacadas del "Sobre mí" de {partnerName}.
            </Text>
            <TouchableOpacity style={[gameStyles.button, { marginBottom: 6 }]} onPress={() => start('choice')}>
              <Text style={gameStyles.buttonText}>Con opciones</Text>
            </TouchableOpacity>
            <Text style={[gameStyles.muted, { textAlign: 'center', marginBottom: 16 }]}>
              Eliges entre 4 y el puntaje sale al instante
            </Text>
            <TouchableOpacity
              style={[gameStyles.button, gameStyles.buttonSecondary, { marginBottom: 6 }]}
              onPress={() => start('text')}
            >
              <Text style={gameStyles.buttonText}>Escribiendo</Text>
            </TouchableOpacity>
            <Text style={[gameStyles.muted, { textAlign: 'center' }]}>
              Escribes tu respuesta y {partnerName} decide si acertaste
            </Text>
          </>
        ) : (
          <Text style={gameStyles.body}>
            {partnerName} necesita responder al menos {QUIZ_MIN_ANSWERS} preguntas de su "Sobre mí" para poder jugar.
          </Text>
        )}
      </View>
    );
  }

  if (phase === 'playing') {
    const item = items[index];
    return (
      <View style={gameStyles.card}>
        <Text style={gameStyles.progress}>{index + 1} / {items.length}</Text>
        <Text style={gameStyles.question}>{item.question}</Text>

        {mode === 'choice' ? (
          <>
            {item.options.map(option => {
              const revealed = picked !== null;
              const isReal = isSameAnswer(option, item.real);
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    gameStyles.option,
                    revealed && isReal && gameStyles.optionCorrect,
                    revealed && option === picked && !isReal && gameStyles.optionWrong,
                  ]}
                  onPress={() => !revealed && setPicked(option)}
                  disabled={revealed}
                >
                  <Text style={gameStyles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
            {picked !== null && (
              <TouchableOpacity
                style={[gameStyles.button, gameStyles.buttonSecondary, { marginTop: 6 }, saving && gameStyles.buttonDisabled]}
                onPress={() => next(picked)}
                disabled={saving}
              >
                <Text style={gameStyles.buttonText}>{index + 1 < items.length ? 'Siguiente' : 'Ver resultado'}</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <TextInput
              style={gameStyles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Tu respuesta..."
              placeholderTextColor={appColors.textLight}
              maxLength={120}
              autoFocus
            />
            <TouchableOpacity
              style={[gameStyles.button, saving && gameStyles.buttonDisabled]}
              onPress={() => next(draft.trim() || 'No sé')}
              disabled={saving}
            >
              <Text style={gameStyles.buttonText}>
                {index + 1 < items.length ? (draft.trim() ? 'Siguiente' : 'No sé') : 'Terminar'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  if (saving) {
    return <ActivityIndicator size="large" color={appColors.primary} />;
  }

  const score = guesses.filter(g => g.correct).length;
  return (
    <View style={gameStyles.card}>
      {mode === 'choice' ? (
        <>
          <Text style={gameStyles.score}>{score}/{guesses.length}</Text>
          <Text style={[gameStyles.heading, { textAlign: 'center' }]}>{scoreLabel(score, guesses.length)}</Text>
          {guesses.filter(g => !g.correct).map(g => (
            <View key={g.question_id} style={{ marginBottom: 10 }}>
              <Text style={gameStyles.label}>{g.question}</Text>
              <Text style={gameStyles.muted}>Dijiste: {g.guess} · Era: {g.real}</Text>
            </View>
          ))}
        </>
      ) : (
        <Text style={[gameStyles.body, { textAlign: 'center', marginBottom: 6 }]}>
          ¡Listo! Le avisamos a {partnerName} para que revise tus respuestas ✦
        </Text>
      )}
      <TouchableOpacity style={[gameStyles.button, { marginTop: 12 }]} onPress={onDone}>
        <Text style={gameStyles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
