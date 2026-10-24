import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts, Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold
} from '@expo-google-fonts/fredoka';
import { appColors } from './src/utils/colors';
import { fonts } from './src/utils/fonts';

// Screens
import HomeScreen from './src/screens/Home';
import MapScreen from './src/screens/Map';
import MusicScreen from './src/screens/Music';
import RouletteScreen from './src/screens/Roulette';
import GalleryScreen from './src/screens/Gallery';
import QuestionsScreen from './src/screens/Questions';
import UserSelect from './src/screens/UserSelect';

const Tab = createBottomTabNavigator();

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold
  });

  useEffect(() => {
    
    const checkUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('currentUser');
        if (savedUser) {
          setCurrentUser(savedUser);
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);


  if (isLoading || !fontsLoaded) {
    return null; 
  }


  if (!currentUser) {
    return <UserSelect onUserSelected={setCurrentUser} />;
  }

 
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              
              if (route.name === 'Inicio') {
                iconName = focused ? 'heart' : 'heart-outline';
              } else if (route.name === 'Pregunta') {
                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              } else if (route.name === 'Mapa') {
                iconName = focused ? 'map' : 'map-outline';
              } else if (route.name === 'Música') {
                iconName = focused ? 'musical-notes' : 'musical-notes-outline';
              } else if (route.name === 'Ruleta') {
                iconName = focused ? 'refresh-circle' : 'refresh-circle-outline';
              } else if (route.name === 'Fotos') {
                iconName = focused ? 'images' : 'images-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            headerShown: false,
            tabBarActiveTintColor: appColors.pink,
            tabBarInactiveTintColor: appColors.textLight,
            tabBarStyle: {
              backgroundColor: appColors.cream,
              borderTopColor: appColors.pinkLight,
              borderTopWidth: 2,
            },
            tabBarLabelStyle: {
              fontFamily: fonts.medium,
              fontSize: 12,
            },
          })}
        >
         
          <Tab.Screen name="Inicio">
            {(props) => <HomeScreen {...props} currentUser={currentUser} setCurrentUser={setCurrentUser} />}
          </Tab.Screen>
          <Tab.Screen name="Pregunta">
            {(props) => <QuestionsScreen {...props} currentUser={currentUser} />}
          </Tab.Screen>
          <Tab.Screen name="Mapa">
            {(props) => <MapScreen {...props} currentUser={currentUser} />}
          </Tab.Screen>
          <Tab.Screen name="Música">
            {(props) => <MusicScreen {...props} currentUser={currentUser} />}
          </Tab.Screen>
          <Tab.Screen name="Ruleta">
            {(props) => <RouletteScreen {...props} currentUser={currentUser} />}
          </Tab.Screen>
          <Tab.Screen name="Fotos">
            {(props) => <GalleryScreen {...props} currentUser={currentUser} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
