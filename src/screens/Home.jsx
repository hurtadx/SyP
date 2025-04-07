import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState('');
  
  useEffect(() => {

    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.getHours().toString().padStart(2, '0') + ':' + 
        now.getMinutes().toString().padStart(2, '0') + ':' + 
        now.getSeconds().toString().padStart(2, '0')
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const sendKissNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "¡Un besito para ti! ",
        body: "muaaaaaaaaaaaaa",
      },
      trigger: null, 
    });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuestra App</Text>
      <Text style={styles.time}>{currentTime}</Text>
      
      <TouchableOpacity style={styles.kissButton} onPress={sendKissNotification}>
        <Text style={styles.buttonText}>Enviar Besito 💋</Text>
      </TouchableOpacity>
      
      <Text style={styles.note}>
        A las 7:37 cada día recibirás un besito virtual ❤️
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff1f1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ff6b6b',
  },
  time: {
    fontSize: 22,
    marginBottom: 30,
    color: '#333',
  },
  kissButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});