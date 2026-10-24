import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appColors } from '../../utils/colors';
import { supabase } from '../../utils/supabase';
import { sendActivityNotification } from '../../utils/notifications';
import { isSameAnswer, scoreLabel } from '../../utils/games';
import { gameStyles } from './gameStyles';

const displayName = (user) => (user === 'salo' ? 'Salo' : 'Tao');

export default function QuizReview({ currentUser, game, onDone }) {
  // Las que coinciden exacto ya vienen marcadas como correctas
  const [marks, setMarks] = useState(game.answers.map(a => isSameAnswer(a.guess, a.real)));
  const [saving, setSaving] = useState(false);

  const toggle = (i, value) => setMarks(marks.map((m, j) => (j === i ? value : m)));

  const finish = async () => {
    setSaving(true);
    const score = marks.filter(Boolean).length;
    try {
      const { error } = await supabase.from('quiz_games')
        .update({
          answers: game.answers.map((a, i) => ({ ...a, correct: marks[i] })),
          score,
          status: 'done',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', game.id);
      if (error) throw error;

      await sendActivityNotification(
        currentUser,
        'quiz',
        `${displayName(currentUser)} revisó tu quiz: sacaste ${score}/${game.total}. ${scoreLabel(score, game.total)}`
      );
      onDone();
    } catch (error) {
      console.error('Error guardando la revisión:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={gameStyles.card}>
      <Text style={gameStyles.heading}>Revisa a {displayName(game.player)}</Text>
      <Text style={[gameStyles.muted, { marginBottom: 16 }]}>
        Marca si acertó cada respuesta sobre ti.
      </Text>

      {game.answers.map((a, i) => (
        <View key={a.question_id} style={{ marginBottom: 16 }}>
          <Text style={gameStyles.label}>{a.question}</Text>
          <Text style={gameStyles.body}>Dijo: {a.guess}</Text>
          <Text style={[gameStyles.muted, { marginBottom: 8 }]}>Tu respuesta: {a.real}</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={[gameStyles.option, { flex: 1, marginRight: 6 }, marks[i] && gameStyles.optionCorrect]}
              onPress={() => toggle(i, true)}
            >
              <Ionicons name="checkmark" size={22} color={appColors.text} style={{ alignSelf: 'center' }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[gameStyles.option, { flex: 1, marginLeft: 6 }, !marks[i] && gameStyles.optionWrong]}
              onPress={() => toggle(i, false)}
            >
              <Ionicons name="close" size={22} color={appColors.text} style={{ alignSelf: 'center' }} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[gameStyles.button, saving && gameStyles.buttonDisabled]}
        onPress={finish}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator color="white" />
          : <Text style={gameStyles.buttonText}>Listo, {marks.filter(Boolean).length}/{game.total}</Text>}
      </TouchableOpacity>
    </View>
  );
}
