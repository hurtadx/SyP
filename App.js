import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';


import HomeScreen from './src/screens/Home';
import MapScreen from './src/screens/Map';
import MusicScreen from './src/screens/Music';
import RouletteScreen from './src/screens/Roulette';
import GalleryScreen from './src/screens/Gallery';

const Tab = createBottomTabNavigator();

export default function App() {
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
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Mapa" component={MapScreen} />
        <Tab.Screen name="Música" component={MusicScreen} />
        <Tab.Screen name="Ruleta" component={RouletteScreen} />
        <Tab.Screen name="Fotos" component={GalleryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
