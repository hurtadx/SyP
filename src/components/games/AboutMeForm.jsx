import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { appColors } from '../../utils/colors';
import { supabase } from '../../utils/supabase';
import { ABOUT_QUESTIONS } from '../../utils/games';
import { gameStyles } from './gameStyles';

export default function AboutMeForm({ currentUser, onDone }) {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('about_me')
          .select('question_id, answer')
          .eq('user_id', currentUser);

        if (error) throw error;
        setValues(Object.fromEntries((data || []).map(a => [a.question_id, a.answer])));
      } catch (error) {
        console.error('Error cargando "Sobre mí":', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const save = async () => {
    setSaving(true);
    Keyboard.dismiss();
    try {
      const filled = ABOUT_QUESTIONS.filter(q => values[q.id]?.trim());
      const empty = ABOUT_QUESTIONS.filter(q => !values[q.id]?.trim()).map(q => q.id);

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

  const answeredCount = ABOUT_QUESTIONS.filter(q => values[q.id]?.trim()).length;

  return (
    <View style={gameStyles.card}>
      <Text style={gameStyles.heading}>Sobre mí</Text>
      <Text style={[gameStyles.muted, { marginBottom: 16 }]}>
        Con esto se arma el quiz para que te adivinen. Puedes dejar preguntas vacías y cambiarlas cuando quieras.
        ({answeredCount}/{ABOUT_QUESTIONS.length})
      </Text>

      {ABOUT_QUESTIONS.map(q => (
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
      ))}

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
