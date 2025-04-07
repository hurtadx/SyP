import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Animated, Easing, ImageBackground } from 'react-native';
import * as Notifications from 'expo-notifications';
import { appColors } from '../utils/colors';

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
  const [remindersActive, setRemindersActive] = useState(false);

  const leftStarRotation = useRef(new Animated.Value(0)).current;
  const rightStarRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    
    const animateStars = () => {
      Animated.sequence([
        Animated.timing(leftStarRotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(leftStarRotation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => animateStars());
      
      
      Animated.sequence([
        Animated.timing(rightStarRotation, {
          toValue: 1,
          duration: 1000,  
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rightStarRotation, {
          toValue: 0,
          duration: 1000,  
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    };
    
    animateStars();
  }, [leftStarRotation, rightStarRotation]);

  const leftStarSpin = leftStarRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg']
  });

  const rightStarSpin = rightStarRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg']  
  });

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

    checkExistingNotifications();

    registerForPushNotificationsAsync();

    return () => clearInterval(interval);
  }, []);

  const checkExistingNotifications = async () => {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    setRemindersActive(scheduledNotifications.length > 0);
  };

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('¡Necesitas permitir notificaciones para recibir recordatorios!');
      return;
    }
  };

  const scheduleDailyReminders = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Prepárate mi amor! 🌞",
          body: "En un minuto es hora de nuestro besito de las 7:37 AM 💋",
        },
        trigger: {
          hour: 7,
          minute: 36,
          repeats: true,
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Prepárate mi amor! 🌙",
          body: "En un minuto es hora de nuestro besito de las 7:37 PM 💋",
        },
        trigger: {
          hour: 19,
          minute: 36,
          repeats: true,
        },
      });

      setRemindersActive(true);
      Alert.alert(
        "Recordatorios activados",
        "Recibirás notificaciones a las 7:36 AM y PM para prepararte para tu besito diario.",
        [{ text: "Entendido" }]
      );

      console.log("Recordatorios programados para 7:36 AM y 7:36 PM");
    } catch (error) {
      console.error("Error al programar recordatorios:", error);
      Alert.alert(
        "Error",
        "No se pudieron programar los recordatorios. Inténtalo de nuevo.",
        [{ text: "OK" }]
      );
    }
  };

  const disableReminders = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setRemindersActive(false);
      Alert.alert(
        "Recordatorios desactivados",
        "Ya no recibirás notificaciones diarias.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error al cancelar recordatorios:", error);
    }
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
    <ImageBackground 
      source={require('../assets/fresitasFondo.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Sal y Pimienta</Text>

        {/* Reloj con conejo */}
        <View style={styles.clockWrapper}>
          <Image
            source={require('../assets/saloIMG/rabbit.png')}
            style={styles.rabbitOverlay}
          />
          <View style={styles.clockContainer}>
            <Text style={styles.time}>{currentTime}</Text>
            <Text style={styles.ampm}>{currentAmPm}</Text>
          </View>
        </View>

        {/* Botón de besito con estrellas más grandes y borde irregular */}
        <View style={styles.papercutWrapper}>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.kissButton}
              onPress={sendKissNotification}
            >
              <View style={styles.buttonContentRow}>
                <Animated.Image
                  source={require('../assets/saloIMG/estrella.png')}
                  style={[styles.starIcon, { transform: [{ rotate: leftStarSpin }] }]}
                />
                <Text style={styles.buttonText}>Enviar Besito</Text>
                <Animated.Image
                  source={require('../assets/saloIMG/estrella.png')}
                  style={[styles.starIcon, { transform: [{ rotate: rightStarSpin }] }]}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón de recordatorios mejorado con borde irregular */}
        <View style={[styles.papercutWrapper, styles.secondaryPapercut]}>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={[
                styles.scheduleButton,
                remindersActive ? styles.activeButton : null
              ]}
              onPress={remindersActive ? disableReminders : scheduleDailyReminders}
            >
              <Text style={styles.buttonText}>
                {remindersActive ? "Desactivar recordatorios" : "Activar recordatorios"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenedor de notas con estampilla */}
        <View style={styles.noteWrapper}>
          <Image
            source={require('../assets/saloIMG/estampilla.png')}
            style={styles.stampOverlay}
          />
          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>Horario de recordatorios:</Text>
            <Text style={styles.note}>• 7:36 AM - Aviso para besito de las 7:37</Text>
            <Text style={styles.note}>• 7:36 PM - Aviso para besito de las 7:37</Text>
            <Text style={styles.noteStatus}>
              Estado: {remindersActive ? "Activados ✅" : "Desactivados ❌"}
            </Text>
          </View>
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
  
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    width: 40,  
    height: 40,  
    marginHorizontal: 10,  
  },
  
  
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 40,  
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#3A539B',  
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  
  clockWrapper: {
    position: 'relative',
    marginBottom: 50,  
    alignItems: 'center',
  },
  rabbitOverlay: {
    position: 'absolute',
    width: 110,  
    height: 110,  
    top: -55,
    right: -45,
    transform: [{ rotate: '15deg' }],
    zIndex: 10,
  },
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 25,  
    paddingVertical: 20,  
    borderRadius: 20,  
    borderWidth: 3,  
    borderColor: appColors.secondary,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  time: {
    fontSize: 42,  
    fontWeight: 'bold',
    color: appColors.text,
  },
  ampm: {
    fontSize: 22,  
    fontWeight: 'bold',
    color: appColors.secondary,
    marginLeft: 8,
  },

  
  buttonWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  noteWrapper: {
    position: 'relative',
    width: '90%',
    alignItems: 'center',
  },
  stampOverlay: {
    position: 'absolute',
    width: 90,  
    height: 90,  
    bottom: -45,
    left: -45,
    transform: [{ rotate: '-10deg' }],
    zIndex: 10,
  },

  
  kissButton: {
    backgroundColor: '#FF7E7E',  
    padding: 18,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#FF9E9E',
    
    borderTopLeftRadius: 35,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 40,
    
    transform: [{ rotate: '0.5deg' }],
  },
  scheduleButton: {
    backgroundColor: '#5D93DC',  
    padding: 18,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#7BA7E1',
    
    borderTopLeftRadius: 25,
    borderTopRightRadius: 38,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 20,
    
    transform: [{ rotate: '-0.7deg' }],
  },
  activeButton: {
    backgroundColor: '#4A78C7',  
    borderColor: '#3A67B2',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,  
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  
  noteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 22,  
    borderRadius: 20,  
    marginTop: 15,
    width: '100%',
    borderWidth: 2,
    borderColor: appColors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  noteTitle: {
    fontSize: 20,  
    fontWeight: 'bold',
    marginBottom: 12,
    color: appColors.accent,
    textAlign: 'center',
  },
  note: {
    color: appColors.textLight,
    marginBottom: 10,  
    fontSize: 17,  
  },
  noteStatus: {
    marginTop: 14,  
    fontWeight: 'bold',
    fontSize: 18,  
    textAlign: 'center',
    color: appColors.text,
  },
  papercutWrapper: {
    position: 'relative',
    width: '92%',
    marginBottom: 25,
    padding: 8,
    backgroundColor: '#FFF0F0', 
    borderTopLeftRadius: 45,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 33,
    borderBottomRightRadius: 50,
    transform: [{ rotate: '0.3deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  secondaryPapercut: {
    backgroundColor: '#EAF2FF', 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 48,
    borderBottomLeftRadius: 52,
    borderBottomRightRadius: 25,
    transform: [{ rotate: '-0.4deg' }],
  },
});