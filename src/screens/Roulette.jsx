import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ImageBackground, 
  ScrollView,
  Modal,
  Image,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appColors } from '../utils/colors';
import { supabase } from '../utils/supabase';
import WheelOfFortune from 'react-native-wheel-of-fortune';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.8;


const PRESET_CATEGORIES = {
  comidas: [
    'Pizza', 'Hamburguesa', 'Sushi', 'Tacos', 'Pasta',
    'Pollo', 'China', 'Parrilla', 'Ensalada', 'Helado'
  ],
  actividades: [
    'Película', 'Restaurante', 'Pasear', 'Series', 
    'Videojuegos', 'Cocinar', 'Picnic'
  ],
  lugares: [
    'Parque', 'Cine', 'Centro', 'Playa', 'Museo', 
    'Cafetería', 'Lago', 'Montaña'
  ],
  personalizada: []
};

export default function RouletteScreen() {
  const [options, setOptions] = useState(PRESET_CATEGORIES.comidas);
  const [newOption, setNewOption] = useState('');
  const [result, setResult] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('comidas');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [customOptions, setCustomOptions] = useState([]);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  
  const wheelRef = useRef(null);
  const starRotation = useRef(new Animated.Value(0)).current;
  
  
  useEffect(() => {
    fetchOptions();
    
    
    const animateStars = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(starRotation, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(starRotation, {
            toValue: 0,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    
    animateStars();
  }, []);
  
  
  useEffect(() => {
    if (currentCategory === 'personalizada') {
      setOptions(customOptions.length > 0 ? customOptions : ['Añade opciones']);
    } else {
      setOptions(PRESET_CATEGORIES[currentCategory]);
    }
  }, [currentCategory, customOptions]);

  const starSpin = starRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-20deg', '20deg']
  });
  
  
  const fetchOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('roulette_options')
        .select('*');

      if (error) {
        console.error('Error al cargar opciones:', error);
        return;
      }

      if (data && data.length > 0) {
        const savedOptions = data.map(item => item.option_text);
        setCustomOptions(savedOptions);
      }
    } catch (error) {
      console.error('Error al cargar opciones:', error);
    }
  };

  const addOption = async () => {
    if (!newOption.trim()) return;
    
    
    if (currentCategory === 'personalizada') {
      try {
        const { error } = await supabase
          .from('roulette_options')
          .insert([{ option_text: newOption }]);
        
        if (error) {
          console.error('Error al guardar opción:', error);
          return;
        }
        
        setCustomOptions([...customOptions, newOption]);
      } catch (error) {
        console.error('Error al guardar opción:', error);
        return;
      }
    } else {
      
      setOptions([...options, newOption]);
    }
    
    setNewOption('');
  };

  const switchCategory = (category) => {
    setCurrentCategory(category);
    setCategoryModalVisible(false);
    setResult('');
  };

  const spinWheel = () => {
    if (wheelRef.current && !isSpinning) {
      setIsSpinning(true);
      wheelRef.current._onPress();
    }
  };

  const getWinner = (value, index) => {
    setResult(value);
    setIsSpinning(false);
    setResultModalVisible(true);
    
    
  };

  return (
    <ImageBackground 
      source={require('../assets/paper_texture.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.overlay}>
          <Text style={styles.title}>Ruleta de Decisiones</Text>
          
          
          <Animated.Image
            source={require('../assets/saloIMG/estrella.png')}
            style={[styles.decorationStar, { transform: [{ rotate: starSpin }] }]}
          />
          
    
          <TouchableOpacity 
            style={styles.categoryButton}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Ionicons name="list" size={22} color={appColors.primary} style={styles.buttonIcon} />
            <Text style={styles.categoryButtonText}>
              {getCategoryName(currentCategory)}
            </Text>
            <Ionicons name="chevron-down" size={22} color="#777" />
          </TouchableOpacity>
          

          <View style={styles.wheelOuterContainer}>
            {options.length > 1 ? (
              <WheelOfFortune
                ref={wheelRef}
                options={{
                  rewards: options,
                  knobSize: 30,
                  borderWidth: 5,
                  borderColor: '#fff',
                  innerRadius: 30,
                  duration: 6000,
                  backgroundColor: 'transparent',
                  textAngle: 'horizontal',
                  knobSource: require('../assets/saloIMG/miku.png'),
                  getWinner: getWinner,
                  colors: getColorArray(options.length),
                  textStyle: styles.wheelTextStyle,
                }}
                style={styles.wheel}
              />
            ) : (
              <View style={styles.emptyWheelContainer}>
                <Text style={styles.emptyWheelText}>
                  Se necesitan al menos 2 opciones para girar la ruleta
                </Text>
                <Image
                  source={require('../assets/saloIMG/rabbit.png')}
                  style={styles.emptyWheelImage}
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.spinButton, (isSpinning || options.length <= 1) && styles.disabledButton]}
            onPress={spinWheel}
            disabled={isSpinning || options.length <= 1}
          >
            <Ionicons name="refresh-circle" size={24} color="white" style={styles.spinIcon} />
            <Text style={styles.buttonText}>¡Girar!</Text>
          </TouchableOpacity>
          

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nueva opción..."
              value={newOption}
              onChangeText={setNewOption}
              onSubmitEditing={addOption}
            />
            <TouchableOpacity 
              style={[styles.addButton, !newOption.trim() && styles.disabledButton]} 
              onPress={addOption}
              disabled={!newOption.trim()}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          

          <View style={styles.optionsListContainer}>
            <Text style={styles.optionsListTitle}>Opciones actuales:</Text>
            <ScrollView 
              style={styles.optionsList}
              contentContainerStyle={styles.optionsListContent}
            >
              {options.map((option, index) => (
                <View key={index} style={styles.optionItem}>
                  <View style={[styles.optionColorIndicator, { backgroundColor: getColorForIndex(index) }]} />
                  <Text style={styles.optionText}>{option}</Text>
                </View>
              ))}
            </ScrollView>
          </View>


          <Modal
            animationType="slide"
            transparent={true}
            visible={categoryModalVisible}
            onRequestClose={() => setCategoryModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Elige una categoría</Text>
                  <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="#999" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.categoryList}>
                  <TouchableOpacity 
                    style={[styles.categoryItem, currentCategory === 'comidas' && styles.activeCategoryItem]} 
                    onPress={() => switchCategory('comidas')}
                  >
                    <Ionicons name="restaurant" size={22} color={currentCategory === 'comidas' ? appColors.primary : "#666"} />
                    <Text style={styles.categoryItemText}>Comidas</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.categoryItem, currentCategory === 'actividades' && styles.activeCategoryItem]} 
                    onPress={() => switchCategory('actividades')}
                  >
                    <Ionicons name="game-controller" size={22} color={currentCategory === 'actividades' ? appColors.primary : "#666"} />
                    <Text style={styles.categoryItemText}>Actividades</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.categoryItem, currentCategory === 'lugares' && styles.activeCategoryItem]} 
                    onPress={() => switchCategory('lugares')}
                  >
                    <Ionicons name="map" size={22} color={currentCategory === 'lugares' ? appColors.primary : "#666"} />
                    <Text style={styles.categoryItemText}>Lugares</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.categoryItem, currentCategory === 'personalizada' && styles.activeCategoryItem]} 
                    onPress={() => switchCategory('personalizada')}
                  >
                    <Ionicons name="create" size={22} color={currentCategory === 'personalizada' ? appColors.primary : "#666"} />
                    <Text style={styles.categoryItemText}>Mi lista personalizada</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
          

          <Modal
            animationType="fade"
            transparent={true}
            visible={resultModalVisible}
            onRequestClose={() => setResultModalVisible(false)}
          >
            <View style={styles.resultModalOverlay}>
              <View style={styles.resultModalContainer}>
                <ImageBackground
                  source={require('../assets/Label.jpg')}
                  style={styles.resultModalBackground}
                  imageStyle={styles.resultModalBackgroundImage}
                >
                  <View style={styles.resultModalContent}>
                    <Text style={styles.resultModalTitle}>¡La decisión es!</Text>
                    <Text style={styles.resultModalText}>{result}</Text>
                    <TouchableOpacity
                      style={styles.resultModalButton}
                      onPress={() => setResultModalVisible(false)}
                    >
                      <Text style={styles.resultModalButtonText}>¡Genial!</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
                
                <Image 
                  source={require('../assets/saloIMG/estampilla.png')}
                  style={styles.resultStamp}
                />
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}


function getCategoryName(category) {
  const names = {
    comidas: 'Comidas 🍕',
    actividades: 'Actividades 🎮',
    lugares: 'Lugares 🗺️',
    personalizada: 'Mi lista personalizada ✏️'
  };
  return names[category] || category;
}

function getColorForIndex(index) {
  const colors = [
    '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
    '#FF9A8C', '#C1CFDA', '#A6CF98', '#F9F9C5',
    '#FBD1A2', '#7DEDFF', '#B983FF', '#ECB390'
  ];
  
  return colors[index % colors.length];
}

function getColorArray(length) {
  return Array(length).fill().map((_, index) => getColorForIndex(index));
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
    color: appColors.primary,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  decorationStar: {
    position: 'absolute',
    top: 10,
    right: 20,
    width: 40,
    height: 40,
    zIndex: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  categoryButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  wheelOuterContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: WHEEL_SIZE / 2,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#f0f0f0',
  },
  wheel: {
    width: '100%',
    height: '100%',
  },
  wheelTextStyle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyWheelContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyWheelText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  emptyWheelImage: {
    width: 80,
    height: 80,
    opacity: 0.7,
  },
  spinButton: {
    backgroundColor: appColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 25,
    transform: [{ rotate: '0.5deg' }],
  },
  spinIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    marginVertical: 15,
    width: '100%',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: 'white',
    fontSize: 16,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  optionsListContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 20,
  },
  optionsListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  optionsList: {
    maxHeight: 150,
  },
  optionsListContent: {
    paddingRight: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  buttonIcon: {
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryList: {
    maxHeight: 320,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeCategoryItem: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 10,
  },
  categoryItemText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#333',
  },
  resultModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  resultModalContainer: {
    width: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  resultModalBackground: {
    width: '100%',
  },
  resultModalBackgroundImage: {
    borderRadius: 20,
  },
  resultModalContent: {
    padding: 25,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  resultModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: appColors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  resultModalText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: appColors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  resultModalButton: {
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
  resultModalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  resultStamp: {
    position: 'absolute',
    width: 80,
    height: 80,
    bottom: -15,
    right: -15,
    transform: [{ rotate: '15deg' }],
    zIndex: 10,
  },
});