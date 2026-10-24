import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { appColors } from '../../utils/colors';
import { fonts } from '../../utils/fonts';
import { supabase } from '../../utils/supabase';
import { sendActivityNotification } from '../../utils/notifications';
import { mostLikelyForDay } from '../../utils/games';
import { dateKey, dayNumber } from '../../utils/questions';
import { gameStyles } from './gameStyles';

const HEART = '♡';
const SPARKLE = '✦';
const MAX_PAST_DAYS = 7;

const USERS = ['salo', 'tao'];
const displayName = (user) => (user === 'salo' ? 'Salo' : 'Tao');
const face = (user) => (user === 'salo' ? require('../../assets/Icons/Sol.png') : require('../../assets/Icons/Tao.png'));

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const formatDateKey = (key) => {
  const [, month, day] = key.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]}`;
};

const matchCount = (a, b) => a.votes.filter((v, i) => v === b.votes[i]).length;

export default function MostLikelyGame({ currentUser }) {
  const otherUser = currentUser === 'salo' ? 'tao' : 'salo';
  const today = dateKey();
  const statements = mostLikelyForDay(dayNumber(new Date()));

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picks, setPicks] = useState(statements.map(() => null));
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const { data, error } = await supabase.from('most_likely_votes')
        .select('*')
        .order('play_date', { ascending: false })
        .limit((MAX_PAST_DAYS + 1) * 2);

      if (error) throw error;
      setRows(data || []);
    } catch (error) {
      console.error('Error cargando ¿Quién es más probable?:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const rowFor = (date, user) => rows.find(r => r.play_date === date && r.user_id === user);
  const mine = rowFor(today, currentUser);
  const theirs = rowFor(today, otherUser);

  // Igual que la pregunta del día: solo días que yo voté, para no ver los votos del otro antes de tiempo
  const pastDays = rows
    .filter(r => r.user_id === currentUser && r.play_date !== today)
    .map(r => ({ mine: r, theirs: rowFor(r.play_date, otherUser) }));

  const submit = async () => {
    if (picks.some(p => !p) || submitting) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('most_likely_votes')
        .insert([{ play_date: today, user_id: currentUser, statements, votes: picks }])
        .select();
      if (error) throw error;

      setRows([...data, ...rows]);

      const message = theirs
        ? `${displayName(currentUser)} votó en ¿Quién es más probable?, ya pueden ver si coinciden ${HEART}`
        : `${displayName(currentUser)} votó en ¿Quién es más probable?, vota para ver sus respuestas`;
      await sendActivityNotification(currentUser, 'most_likely', message, { play_date: today });
    } catch (error) {
      console.error('Error guardando votos:', error);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const renderFace = (user) => <Image source={face(user)} style={styles.face} resizeMode="contain" />;

  const renderResults = (myRow, theirRow) => (
    <>
      {theirRow && (
        <Text style={styles.matchTitle}>
          Coincidieron en {matchCount(myRow, theirRow)}/{myRow.votes.length} {HEART}
        </Text>
      )}
      {myRow.statements.map((statement, i) => (
        <View key={statement} style={styles.resultRow}>
          <Text style={styles.resultStatement}>…{statement}</Text>
          <View style={styles.resultVotes}>
            <Text style={styles.voteLabel}>Tú</Text>
            {renderFace(myRow.votes[i])}
            {theirRow && (
              <>
                <Text style={[styles.voteLabel, { marginLeft: 10 }]}>{displayName(otherUser)}</Text>
                {renderFace(theirRow.votes[i])}
                {theirRow.votes[i] === myRow.votes[i] && <Text style={styles.matchMark}>{SPARKLE}</Text>}
              </>
            )}
          </View>
        </View>
      ))}
    </>
  );

  if (loading) {
    return <ActivityIndicator size="large" color={appColors.primary} />;
  }

  return (
    <>
      <View style={gameStyles.card}>
        <Text style={[gameStyles.muted, { textAlign: 'center', marginBottom: 12 }]}>
          {SPARKLE} {statements.length} nuevas cada día {SPARKLE}
        </Text>

        {mine ? (
          <>
            {renderResults(mine, theirs)}
            {!theirs && (
              <Text style={[gameStyles.muted, { textAlign: 'center', marginTop: 6 }]}>
                {displayName(otherUser)} aún no vota {HEART}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={[gameStyles.muted, { textAlign: 'center', marginBottom: 14 }]}>
              {theirs
                ? `${displayName(otherUser)} ya votó ${SPARKLE} vota para ver sus respuestas`
                : `${displayName(otherUser)} aún no vota, ¡vota tú primero!`}
            </Text>
            <Text style={gameStyles.label}>¿Quién es más probable que…</Text>
            {statements.map((statement, i) => (
              <View key={statement} style={styles.voteCard}>
                <Text style={styles.statement}>…{statement}?</Text>
                <View style={styles.voteButtons}>
                  {USERS.map(user => (
                    <TouchableOpacity
                      key={user}
                      style={[
                        styles.voteButton,
                        picks[i] === user && (user === 'salo' ? styles.voteSalo : styles.voteTao),
                      ]}
                      onPress={() => setPicks(picks.map((p, j) => (j === i ? user : p)))}
                    >
                      {renderFace(user)}
                      <Text style={styles.voteName}>{displayName(user)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={[gameStyles.button, (picks.some(p => !p) || submitting) && gameStyles.buttonDisabled]}
              onPress={submit}
              disabled={picks.some(p => !p) || submitting}
            >
              {submitting
                ? <ActivityIndicator color="white" />
                : <Text style={gameStyles.buttonText}>Votar</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>

      {pastDays.length > 0 && (
        <>
          <Text style={[gameStyles.heading, { marginTop: 4 }]}>Días anteriores</Text>
          {pastDays.map(({ mine: myRow, theirs: theirRow }) => (
            <View key={myRow.id} style={gameStyles.card}>
              <Text style={[gameStyles.muted, { marginBottom: 6 }]}>{formatDateKey(myRow.play_date)}</Text>
              {renderResults(myRow, theirRow)}
              {!theirRow && (
                <Text style={[gameStyles.muted, { textAlign: 'center' }]}>{displayName(otherUser)} no votó</Text>
              )}
            </View>
          ))}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  face: {
    width: 26,
    height: 26,
  },
  voteCard: {
    backgroundColor: appColors.cream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: appColors.pinkLight,
    padding: 12,
    marginBottom: 12,
  },
  statement: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: appColors.text,
    marginBottom: 10,
  },
  voteButtons: {
    flexDirection: 'row',
  },
  voteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: appColors.pinkLight,
    backgroundColor: 'white',
  },
  voteSalo: {
    backgroundColor: 'rgba(240, 138, 138, 0.25)',
    borderColor: appColors.pink,
  },
  voteTao: {
    backgroundColor: 'rgba(124, 143, 214, 0.25)',
    borderColor: appColors.primary,
  },
  voteName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: appColors.text,
    marginLeft: 6,
  },
  matchTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: appColors.pink,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: appColors.pinkLight,
  },
  resultStatement: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: appColors.text,
    marginBottom: 6,
  },
  resultVotes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: appColors.textLight,
    marginRight: 4,
  },
  matchMark: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: appColors.pink,
    marginLeft: 8,
  },
});
