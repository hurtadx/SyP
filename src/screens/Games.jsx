import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground,
  KeyboardAvoidingView, Platform, BackHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appColors } from '../utils/colors';
import { supabase } from '../utils/supabase';
import { aboutForDay } from '../utils/games';
import { fonts } from '../utils/fonts';
import RouletteScreen from './Roulette';
import AboutMeForm from '../components/games/AboutMeForm';
import QuizGame from '../components/games/QuizGame';
import MostLikelyGame from '../components/games/MostLikelyGame';
import { dateKey, dayNumber } from '../utils/questions';

const SPARKLE = '✦';

const displayName = (user) => (user === 'salo' ? 'Salo' : 'Tao');

const MAX_HISTORY = 10;

const GAMES = [
  { id: 'mostLikely', title: '¿Quién es más probable?', subtitle: 'Nuevas cada día', icon: 'people-circle' },
  { id: 'quiz', title: '¿Qué tanto me conoces?', subtitle: 'Adivina las respuestas del otro', icon: 'help-circle' },
  { id: 'about', title: 'Sobre mí', subtitle: 'Preguntas nuevas cada día', icon: 'person-circle' },
  { id: 'roulette', title: 'Ruleta', subtitle: '¿Qué hacemos hoy?', icon: 'refresh-circle' },
];

export default function GamesScreen({ currentUser }) {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState('menu');
  const [myAnswerIds, setMyAnswerIds] = useState([]);
  const [history, setHistory] = useState([]);
  const [mostLikelyToday, setMostLikelyToday] = useState([]);

  const loadMenu = async () => {
    try {
      const [about, done, votes] = await Promise.all([
        supabase.from('about_me').select('question_id').eq('user_id', currentUser),
        supabase.from('quiz_games').select('id, player, about_user, score, total, created_at')
          .eq('status', 'done')
          .order('created_at', { ascending: false })
          .limit(MAX_HISTORY),
        supabase.from('most_likely_votes').select('user_id').eq('play_date', dateKey()),
      ]);

      if (about.error) throw about.error;
      if (done.error) throw done.error;
      if (votes.error) throw votes.error;

      setMyAnswerIds(about.data.map(a => a.question_id));
      setHistory(done.data);
      setMostLikelyToday(votes.data.map(v => v.user_id));
    } catch (error) {
      console.error('Error cargando juegos:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (view === 'menu') loadMenu();
    }, [view])
  );

  const backToMenu = () => setView('menu');

  // El botón atrás del celular vuelve al menú de juegos en vez de salir de la pestaña
  useEffect(() => {
    if (view === 'menu') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setView('menu');
      return true;
    });
    return () => subscription.remove();
  }, [view]);

  if (view === 'roulette') {
    return (
      <View style={styles.flex}>
        <RouletteScreen currentUser={currentUser} />
        <TouchableOpacity style={[styles.floatingBack, { top: insets.top + 10 }]} onPress={backToMenu}>
          <Ionicons name="chevron-back" size={24} color={appColors.primary} />
        </TouchableOpacity>
      </View>
    );
  }

  const otherUser = currentUser === 'salo' ? 'tao' : 'salo';

  const subtitleFor = (game) => {
    if (game.id === 'about') {
      const todayIds = aboutForDay(dayNumber(new Date())).map(q => q.id);
      const pending = todayIds.filter(id => !myAnswerIds.includes(id)).length;
      return pending > 0 ? `${pending} nuevas hoy ✦ · ${myAnswerIds.length} respondidas` : `Al día ✓ · ${myAnswerIds.length} respondidas`;
    }
    if (game.id === 'mostLikely') {
      if (mostLikelyToday.includes(currentUser)) return 'Ya votaste hoy ✓';
      if (mostLikelyToday.includes(otherUser)) return `${displayName(otherUser)} ya votó, ¡te toca!`;
      return `${game.subtitle} · ¡vota hoy!`;
    }
    return game.subtitle;
  };

  const titles = { mostLikely: '¿Quién es más probable?', about: 'Sobre mí', quiz: '¿Qué tanto me conoces?' };

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
          <View style={styles.header}>
            <Text style={styles.pageTitle} numberOfLines={1}>
              {view === 'menu' ? 'Juegos' : titles[view]}
            </Text>
            {view !== 'menu' && (
              <TouchableOpacity style={styles.backButton} onPress={backToMenu} hitSlop={12}>
                <Ionicons name="chevron-back" size={26} color={appColors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {view === 'about' && <AboutMeForm currentUser={currentUser} onDone={backToMenu} />}
          {view === 'mostLikely' && <MostLikelyGame currentUser={currentUser} />}
          {view === 'quiz' && <QuizGame currentUser={currentUser} onDone={backToMenu} />}

          {view === 'menu' && (
            <>
              {GAMES.map(game => (
                <TouchableOpacity key={game.id} style={styles.gameCard} onPress={() => setView(game.id)}>
                  <Ionicons name={game.icon} size={40} color={appColors.pink} />
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameTitle}>{game.title}</Text>
                    <Text style={styles.gameSubtitle}>{subtitleFor(game)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={appColors.textLight} />
                </TouchableOpacity>
              ))}

              {history.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Partidas</Text>
                  {history.map(game => (
                    <View key={game.id} style={styles.historyRow}>
                      <Text style={styles.historyText}>
                        {displayName(game.player)} sobre {displayName(game.about_user)}
                      </Text>
                      <Text style={styles.historyScore}>{game.score}/{game.total} {SPARKLE}</Text>
                    </View>
                  ))}
                </>
              )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  floatingBack: {
    position: 'absolute',
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: appColors.primary,
    textAlign: 'center',
    paddingHorizontal: 32,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: appColors.pinkLight,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  gameInfo: {
    flex: 1,
    marginLeft: 14,
  },
  gameTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: appColors.text,
  },
  gameSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: appColors.textLight,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: appColors.accent,
    marginTop: 10,
    marginBottom: 10,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  historyText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: appColors.text,
  },
  historyScore: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: appColors.pink,
  },
});
