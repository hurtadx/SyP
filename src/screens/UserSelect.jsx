import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appColors } from '../utils/colors';

export default function UserSelect({ onUserSelected }) {
  const selectUser = async (user) => {
    try {
      
      await AsyncStorage.setItem('currentUser', user);
      
      onUserSelected(user);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/fresitasFondo.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>¿Quién eres?</Text>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.userButton}
            onPress={() => selectUser('salo')}
          >
            <Text style={styles.buttonText}>Salo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.userButton, styles.userButton2]}
            onPress={() => selectUser('tao')}
          >
            <Text style={styles.buttonText}>Tao</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 50,
    color: '#3A539B',
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: 160,
  },
  userButton: {
    backgroundColor: '#FF7E7E',
    paddingVertical: 18,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  userButton2: {
    backgroundColor: '#4B89DC',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
});