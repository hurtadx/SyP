import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import HomeScreen from './src/screens/Home';
import MapScreen from './src/screens/Map';
import MusicScreen from './src/screens/Music';
import RouletteScreen from './src/screens/Roulette';
import GalleryScreen from './src/screens/Gallery';
import UserSelect from './src/screens/UserSelect';

const Tab = createBottomTabNavigator();

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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


  if (isLoading) {
    return null; 
  }


  if (!currentUser) {
    return <UserSelect onUserSelected={setCurrentUser} />;
  }

 
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'Inicio') {
              iconName = focused ? 'heart' : 'heart-outline';
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
          tabBarActiveTintColor: '#ff6b6b',
          tabBarInactiveTintColor: 'gray',
        })}
      >
       
        <Tab.Screen 
          name="Inicio" 
          options={{ title: `Inicio (${currentUser})` }}
        >
          {(props) => <HomeScreen {...props} currentUser={currentUser} setCurrentUser={setCurrentUser} />}
        </Tab.Screen>
        <Tab.Screen name="Mapa">
          {(props) => <MapScreen {...props} currentUser={currentUser} />}
        </Tab.Screen>
        <Tab.Screen name="Música" component={MusicScreen} />
        <Tab.Screen name="Ruleta" component={RouletteScreen} />
        <Tab.Screen name="Fotos" component={GalleryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
