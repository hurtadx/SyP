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
      source={require('../assets/fondos/fresitasFondo.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>¿Quién eres?</Text>
        
        <View style={styles.iconsContainer}>
        
          <TouchableOpacity 
            style={styles.iconWrapper}
            onPress={() => selectUser('salo')}
          >
            <View style={[styles.iconGlow, styles.saloGlow]}>
              <View style={styles.iconOuterBorder}>
                <View style={[styles.iconBorder, styles.saloBorder]}>
                  <Image 
                    source={require('../assets/Icons/Sol.png')} 
                    style={styles.userIcon} 
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
            <Text style={[styles.iconLabel, styles.saloLabel]}>Salo</Text>
          </TouchableOpacity>
          
          
          <TouchableOpacity 
            style={styles.iconWrapper}
            onPress={() => selectUser('tao')}
          >
            <View style={[styles.iconGlow, styles.taoGlow]}>
              <View style={styles.iconOuterBorder}>
                <View style={[styles.iconBorder, styles.taoBorder]}>
                  <Image 
                    source={require('../assets/Icons/Tao.png')} 
                    style={styles.userIcon} 
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
            <Text style={[styles.iconLabel, styles.taoLabel]}>Tao</Text>
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
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 70,
    color: '#3A539B',
    textShadowColor: 'white',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  iconsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  iconGlow: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  saloGlow: {
    backgroundColor: 'rgba(255, 200, 200, 0.5)',
  },
  taoGlow: {
    backgroundColor: 'rgba(200, 200, 255, 0.5)',
  },
  iconOuterBorder: {
    width: 135,
    height: 135,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'white',
    borderStyle: 'dotted',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  iconBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  saloBorder: {
    backgroundColor: 'rgba(255, 126, 126, 0.7)',
    borderWidth: 2,
    borderColor: 'rgba(255, 126, 126, 0.9)',
  },
  taoBorder: {
    backgroundColor: 'rgba(75, 137, 220, 0.7)',
    borderWidth: 2,
    borderColor: 'rgba(75, 137, 220, 0.9)',
  },
  userIcon: {
    width: 100,
    height: 100,
  },
  iconLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  saloLabel: {
    color: '#FF7E7E',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
  },
  taoLabel: {
    color: '#4B89DC',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
  }
});