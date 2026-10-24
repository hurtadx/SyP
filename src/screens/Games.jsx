import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appColors } from '../utils/colors';
import { supabase } from '../utils/supabase';
import { ABOUT_QUESTIONS } from '../utils/games';
import { fonts } from '../utils/fonts';
import RouletteScreen from './Roulette';
import AboutMeForm from '../components/games/AboutMeForm';
import QuizGame from '../components/games/QuizGame';
import QuizReview from '../components/games/QuizReview';

const SPARKLE = '✦';

const displayName = (user) => (user === 'salo' ? 'Salo' : 'Tao');

const MAX_HISTORY = 10;

const GAMES = [
  { id: 'quiz', title: '¿Qué tanto me conoces?', subtitle: 'Adivina las respuestas del otro', icon: 'help-circle' },
  { id: 'about', title: 'Sobre mí', subtitle: 'Tus respuestas para el quiz', icon: 'person-circle' },
  { id: 'roulette', title: 'Ruleta', subtitle: '¿Qué hacemos hoy?', icon: 'refresh-circle' },
];

export default function GamesScreen({ currentUser }) {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState('menu');
  const [reviewGame, setReviewGame] = useState(null);
  const [myAnswerCount, setMyAnswerCount] = useState(0);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [history, setHistory] = useState([]);

  const loadMenu = async () => {
    try {
      const [about, pending, done] = await Promise.all([
        supabase.from('about_me').select('question_id').eq('user_id', currentUser),
        supabase.from('quiz_games').select('*')
          .eq('about_user', currentUser)
          .eq('status', 'pending_review')
          .order('created_at', { ascending: true }),
        supabase.from('quiz_games').select('id, player, about_user, mode, score, total, created_at')
          .eq('status', 'done')
          .order('created_at', { ascending: false })
          .limit(MAX_HISTORY),
      ]);

      if (about.error) throw about.error;
      if (pending.error) throw pending.error;
      if (done.error) throw done.error;

      setMyAnswerCount(about.data.length);
      setPendingReviews(pending.data);
      setHistory(done.data);
    } catch (error) {
      console.error('Error cargando juegos:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (view === 'menu') loadMenu();
    }, [view])
  );

  const backToMenu = () => {
    setReviewGame(null);
    setView('menu');
  };

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

  const titles = { about: 'Sobre mí', quiz: '¿Qué tanto me conoces?', review: 'Revisar quiz' };

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
            {view !== 'menu' && (
              <TouchableOpacity style={styles.backButton} onPress={backToMenu} hitSlop={10}>
                <Ionicons name="chevron-back" size={26} color={appColors.primary} />
              </TouchableOpacity>
            )}
            <Text style={styles.pageTitle} numberOfLines={1}>
              {view === 'menu' ? 'Juegos' : titles[view]}
            </Text>
          </View>

          {view === 'about' && <AboutMeForm currentUser={currentUser} onDone={backToMenu} />}
          {view === 'quiz' && <QuizGame currentUser={currentUser} onDone={backToMenu} />}
          {view === 'review' && reviewGame && (
            <QuizReview currentUser={currentUser} game={reviewGame} onDone={backToMenu} />
          )}

          {view === 'menu' && (
            <>
              {pendingReviews.map(game => (
                <TouchableOpacity
                  key={game.id}
                  style={styles.pendingBanner}
                  onPress={() => {
                    setReviewGame(game);
                    setView('review');
                  }}
                >
                  <Ionicons name="notifications" size={22} color="white" />
                  <Text style={styles.pendingText}>
                    {displayName(game.player)} jugó tu quiz escribiendo, ¡revísalo!
                  </Text>
                  <Ionicons name="chevron-forward" size={22} color="white" />
                </TouchableOpacity>
              ))}

              {GAMES.map(game => (
                <TouchableOpacity key={game.id} style={styles.gameCard} onPress={() => setView(game.id)}>
                  <Ionicons name={game.icon} size={40} color={appColors.pink} />
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameTitle}>{game.title}</Text>
                    <Text style={styles.gameSubtitle}>
                      {game.id === 'about'
                        ? `${game.subtitle} · ${myAnswerCount}/${ABOUT_QUESTIONS.length}`
                        : game.subtitle}
                    </Text>
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
                        <Text style={styles.historyMode}>
                          {'  '}{game.mode === 'choice' ? 'opciones' : 'escribiendo'}
                        </Text>
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
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.pink,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  pendingText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: 'white',
    marginHorizontal: 10,
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
  historyMode: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: appColors.textLight,
  },
  historyScore: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: appColors.pink,
  },
});
