import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';

export default function RouletteScreen() {
  const [options, setOptions] = useState(['Película', 'Restaurante', 'Pasear', 'Ver series']);
  const [newOption, setNewOption] = useState('');
  const [result, setResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('roulette_options')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        setOptions(data.map(item => item.option_text));
      }
    } catch (error) {
      console.error('Error al cargar opciones:', error);
    }
  };

  const addOption = async () => {
    if (newOption.trim() === '') return;
    
    try {
      const { error } = await supabase
        .from('roulette_options')
        .insert([{ option_text: newOption }]);

      if (error) throw error;

      setOptions([...options, newOption]);
      setNewOption('');
    } catch (error) {
      console.error('Error al añadir opción:', error);
    }
  };

  const spin = () => {

    setResult(null);
    setIsSpinning(true);
    

    spinValue.setValue(0);
    

    const numRotations = 5 + Math.random() * 5;
    
    Animated.timing(spinValue, {
      toValue: numRotations,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      
      
      const finalAngle = numRotations * 360 % 360;
      
     
      const segmentSize = 360 / options.length;
      let selectedIndex = Math.floor(finalAngle / segmentSize);
      selectedIndex = options.length - 1 - selectedIndex; 
      
      setResult(options[selectedIndex]);
    });
  };

  
  const spin360 = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  
  const wheelSegments = options.map((option, index) => {
    const segmentSize = 360 / options.length;
    const startAngle = index * segmentSize;
    const segmentColor = getColorForIndex(index);
    
    return (
      <View
        key={index}
        style={[
          styles.segment,
          {
            backgroundColor: segmentColor,
            transform: [
              { rotate: `${startAngle}deg` },
            ],
          },
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            { transform: [{ rotate: `${segmentSize / 2}deg` }] }
          ]}
        >
          {option}
        </Text>
      </View>
    );
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ruleta de Decisiones</Text>
      
      <View style={styles.wheelContainer}>
        <Animated.View
          style={[
            styles.wheel,
            { transform: [{ rotate: spin360 }] },
          ]}
        >
          {wheelSegments}
        </Animated.View>
        <View style={styles.pointer} />
      </View>
      
      <TouchableOpacity
        style={styles.spinButton}
        onPress={spin}
        disabled={isSpinning}
      >
        <Text style={styles.buttonText}>¡Girar!</Text>
      </TouchableOpacity>
      
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Decisión:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nueva opción..."
          value={newOption}
          onChangeText={setNewOption}
        />
        <TouchableOpacity style={styles.addButton} onPress={addOption}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}


const getColorForIndex = (index) => {
  const colors = [
    '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
    '#FF9A8C', '#C1CFDA', '#A6CF98', '#F9F9C5',
    '#FBD1A2', '#7DEDFF', '#B983FF', '#ECB390'
  ];
  
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ff6b6b',
  },
  wheelContainer: {
    width: 280,
    height: 280,
    margin: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    width: 280,
    height: 280,
    borderRadius: 140,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  segment: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    left: '50%',
    top: 0,
    transformOrigin: 'bottom left',
  },
  segmentText: {
    position: 'absolute',
    left: 30,
    top: 20,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    width: 100,
  },
  pointer: {
    position: 'absolute',
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 30,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ff6b6b',
    zIndex: 10,
  },
  spinButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    width: '80%',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
  },
});