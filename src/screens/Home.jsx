import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, Image, 
  Animated, Easing, ImageBackground, Modal
} from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appColors } from '../utils/colors';
import { supabase } from '../utils/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen({ currentUser, setCurrentUser }) {
  const [currentTime, setCurrentTime] = useState('');
  const [currentAmPm, setCurrentAmPm] = useState('');
  const [remindersActive, setRemindersActive] = useState(false);
  
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    buttonText: 'OK'
  });

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

  
  const showCustomModal = (title, message, buttonText = 'OK') => {
    setModalContent({
      title,
      message,
      buttonText
    });
    setModalVisible(true);
  };

  const scheduleDailyReminders = async () => {
    try {
      
      setRemindersActive(true);
      
      
      await Notifications.cancelAllScheduledNotificationsAsync();
  
      
      const morningTriggerDate = new Date();
      
      
      morningTriggerDate.setHours(7);
      morningTriggerDate.setMinutes(36);
      morningTriggerDate.setSeconds(0);
      
      
      if (morningTriggerDate <= new Date()) {
        morningTriggerDate.setDate(morningTriggerDate.getDate() + 1);
      }
  
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Prepárate mi amor! 🌞",
          body: "En un minuto es hora de nuestro besito de las 7:37 AM 💋",
        },
        trigger: {
          channelId: 'default',
          date: morningTriggerDate,
          repeats: true,
          seconds: 60 * 60 * 24, 
        },
      });
  
      
      const eveningTriggerDate = new Date();
      
      
      eveningTriggerDate.setHours(19);
      eveningTriggerDate.setMinutes(36);
      eveningTriggerDate.setSeconds(0);
      
      
      if (eveningTriggerDate <= new Date()) {
        eveningTriggerDate.setDate(eveningTriggerDate.getDate() + 1);
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Prepárate mi amor! 🌙",
          body: "En un minuto es hora de nuestro besito de las 7:37 PM 💋",
        },
        trigger: {
          channelId: 'default',
          date: eveningTriggerDate,
          repeats: true,
          seconds: 60 * 60 * 24, 
        },
      });
  
      
      showCustomModal(
        "Recordatorios activados",
        "Recibirás notificaciones a las 7:36 AM y PM para prepararte para tu besito diario.",
        "Entendido"
      );
  
      console.log("Recordatorios programados para 7:36 AM y 7:36 PM");
    } catch (error) {
      
      setRemindersActive(false);
      console.error("Error al programar recordatorios:", error);
      showCustomModal(
        "Error",
        "No se pudieron programar los recordatorios. Inténtalo de nuevo.",
        "OK"
      );
    }
  };

  const disableReminders = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setRemindersActive(false);
      showCustomModal(
        "Recordatorios desactivados",
        "Ya no recibirás notificaciones diarias.",
        "OK"
      );
    } catch (error) {
      console.error("Error al cancelar recordatorios:", error);
    }
  };

  const sendKissNotification = async () => {
    try {
      const otherUser = currentUser === 'salo' ? 'tao' : 'salo';
      
      const { error } = await supabase.from('notifications')
        .insert([{
          from_user: currentUser,
          to_user: otherUser,
          type: 'kiss',
          message: `¡${currentUser} te envió un besito! 💋`,
          seen: false,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      showCustomModal(
        "Besito enviado",
        `${otherUser === 'salo' ? 'Salo' : 'Tao'} recibirá tu besito ❤️`,
        "¡Listo!"
      );
    } catch (error) {
      console.error('Error enviando besito:', error);
    }
  };

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const { data, error } = await supabase.from('notifications')
          .select('*')
          .eq('to_user', currentUser)
          .eq('seen', false);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const notificationIds = data.map(n => n.id);
          await supabase.from('notifications')
            .update({ seen: true })
            .in('id', notificationIds);
          
          data.forEach(async notification => {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "¡Un besito para ti! 💋",
                body: notification.message,
              },
              trigger: null,
            });
          });
        }
      } catch (error) {
        console.error('Error verificando notificaciones:', error);
      }
    };
    
    checkNotifications();
    const interval = setInterval(checkNotifications, 15000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      setCurrentUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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

        {/* Botón de besito con estrellas */}
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

        {/* Botón de recordatorios con estampilla e indicador de estado */}
        <View style={styles.reminderSectionWrapper}>
          <View style={[styles.papercutWrapper, styles.secondaryPapercut]}>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[
                  styles.scheduleButton,
                  remindersActive ? styles.activeButton : null
                ]}
                onPress={remindersActive ? disableReminders : scheduleDailyReminders}
              >
                <View style={styles.buttonContentRow}>
                  <Text style={styles.buttonText}>
                    {remindersActive ? "Desactivar recordatorios" : "Activar recordatorios"}
                  </Text>
                  {remindersActive && <Text style={styles.statusIndicator}>✅</Text>}
                </View>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Estampilla reposicionada como decoración */}
          <Image
            source={require('../assets/saloIMG/estampilla.png')}
            style={styles.stampOverlayRepositioned}
          />
        </View>

        {/* Modal personalizado con fondo de imagen */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalContainer}>
              <ImageBackground
                source={require('../assets/Label.jpg')}
                style={styles.modalBackground}
                imageStyle={styles.modalBackgroundImage}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{modalContent.title}</Text>
                  <Text style={styles.modalText}>{modalContent.message}</Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>{modalContent.buttonText}</Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>
          </View>
        </Modal>

        {/* Botón para cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>

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
  stampOverlayRepositioned: {
    position: 'absolute',
    width: 90,  
    height: 90,  
    bottom: -30,
    right: 0,
    transform: [{ rotate: '8deg' }],
    zIndex: 0,
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
  statusIndicator: {
    fontSize: 22,
    marginLeft: 10,
    color: 'white',
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
  reminderSectionWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalBackground: {
    width: '100%',
  },
  modalBackgroundImage: {
    borderRadius: 20,
  },
  modalContent: {
    padding: 25,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)', 
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: appColors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    color: appColors.textLight,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: appColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 10,
    
    borderTopLeftRadius: 25,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 25,
    transform: [{ rotate: '0.5deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FF7E7E',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
});