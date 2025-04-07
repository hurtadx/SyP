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
  const [currentAmPm, setCurrentAmPm] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12;
      
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      setCurrentAmPm(ampm);
    }, 1000);
    
    scheduleDailyKisses();
    registerForPushNotificationsAsync();
    
    return () => clearInterval(interval);
  }, []);
  
  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('¡Necesitas permitir notificaciones para recibir besitos diarios!');
      return;
    }
  };
  
  const scheduleDailyKisses = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "¡Buenos días mi amor! 🌞",
        body: "Es hora de nuestro besito de las 7:37 AM 💋",
      },
      trigger: {
        hour: 7,
        minute: 37,
        repeats: true,
      },
    });
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "¡Buenas tardes mi amor! 🌙",
        body: "Es hora de nuestro besito de las 7:37 PM 💋",
      },
      trigger: {
        hour: 19,
        minute: 37,
        repeats: true,
      },
    });

    console.log("Notificaciones programadas para 7:37 AM y 7:37 PM");
  };
  
  const sendKissNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "¡Un besito para ti! 💋",
        body: "muaaaaaaaaaaaaa",
      },
      trigger: null, 
    });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sal y Pimienta</Text>
      
      <View style={styles.clockContainer}>
        <Text style={styles.time}>{currentTime}</Text>
        <Text style={styles.ampm}>{currentAmPm}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.kissButton} 
        onPress={sendKissNotification}
      >
        <Text style={styles.buttonText}>Enviar Besito 💋</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.scheduleButton} 
        onPress={scheduleDailyKisses}
      >
        <Text style={styles.buttonText}>Activar besitos diarios</Text>
      </TouchableOpacity>
      
      <View style={styles.noteContainer}>
        <Text style={styles.noteTitle}>Horario de besitos:</Text>
        <Text style={styles.note}>• 7:37 AM - Besito de buenos días</Text>
        <Text style={styles.note}>• 7:37 PM - Besito de buenas noches</Text>
      </View>
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
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 40,
  },
  time: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  ampm: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginLeft: 8,
  },
  kissButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
  },
  scheduleButton: {
    backgroundColor: '#ff9e9e',
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
  noteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    width: '90%',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  note: {
    color: '#666',
    marginBottom: 5,
    fontSize: 15,
  }
});