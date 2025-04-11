import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
import { appColors } from '../utils/colors';

const VerticalWheelOfFortune = ({ options = [], colors = [], onFinish }) => {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  
  const wheelOptions = options.length > 0 ? options : [
    'Pizza', 'Hambur.', 'Sushi', 'Tacos', 'Pasta',
    'Pollo', 'China', 'Parrilla', 'Ensalada', 'Helado'
  ];
  
  
  const wheelColors = colors.length > 0 ? colors : [
    "#FF5252", "#FF7752", "#FFB752", "#FFE652", 
    "#B4FF52", "#52FF9A", "#52FFFF", "#5286FF",
    "#A952FF", "#FF52B4"
  ];

  const windowWidth = Dimensions.get('window').width;
  const size = windowWidth * 0.85; 
  const centerX = size / 2;
  const centerY = size / 2;
  const wheelRadius = size * 0.42; 

  const spinWheel = () => {
    if (spinning) return;
    
    setWinner(null);
    setSpinning(true);
    
    
    const randomSpin = 1440 + Math.floor(Math.random() * 1440);
    
    Animated.timing(spinValue, {
      toValue: randomSpin / 360,
      duration: 3000, 
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(() => {
      
      const degrees = randomSpin % 360;
      const optionIndex = Math.floor((360 - degrees) / (360 / wheelOptions.length));
      
      const winnerText = wheelOptions[optionIndex % wheelOptions.length] === 'Hambur.' ? 
        'Hamburguesa' : wheelOptions[optionIndex % wheelOptions.length];
      
      setWinner(winnerText);
      
      if (onFinish) {
        onFinish(winnerText);
      }
      
      setSpinning(false);
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.containerOuter}>
      
      <View style={styles.wheelOuterContainer}>
        
        <View style={styles.markerRight}>
          <Svg height={20} width={30} viewBox="0 0 30 20">
            <Path 
              d="M 0,10 L 20,0 L 20,20 Z" 
              fill="#FF3131" 
              stroke="white" 
              strokeWidth="1"
            />
          </Svg>
        </View>
        
        
        <View style={styles.wheelContainer}>
          <Animated.View 
            style={{
              width: size,
              height: size,
              transform: [{ rotate: spin }]
            }}
          >
            <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
              
              <Circle 
                cx={centerX} 
                cy={centerY} 
                r={wheelRadius * 0.12} 
                fill="#FFD700" 
                stroke="white" 
                strokeWidth="2" 
              />
              
              {wheelOptions.map((option, index) => {
                const angle = (index * 360) / wheelOptions.length;
                const sliceAngle = 360 / wheelOptions.length;
                const rad = (angle * Math.PI) / 180;
                const radEnd = ((angle + sliceAngle) * Math.PI) / 180;
                
                return (
                  <G key={index}>
                    
                    <Path 
                      d={`M ${centerX},${centerY} 
                         L ${centerX + wheelRadius * Math.cos(rad)},${centerY + wheelRadius * Math.sin(rad)} 
                         A ${wheelRadius},${wheelRadius} 0 0,1 
                         ${centerX + wheelRadius * Math.cos(radEnd)},
                         ${centerY + wheelRadius * Math.sin(radEnd)} Z`}
                      fill={wheelColors[index % wheelColors.length]}
                      stroke="white"
                      strokeWidth="1"
                    />
                    
                    
                    <G 
                      rotation={90 + angle + sliceAngle / 2}
                      origin={`${centerX}, ${centerY}`}
                    >
                      <SvgText
                        x={centerX}
                        y={centerY - wheelRadius * 0.7}
                        fill="white"
                        fontWeight="bold"
                        fontSize={wheelOptions.length > 8 ? "11" : "13"}
                        textAnchor="middle"
                        rotation={90}
                        originX={centerX}
                        originY={centerY - wheelRadius * 0.7}
                      >
                        {option}
                      </SvgText>
                    </G>
                  </G>
                );
              })}
            </Svg>
          </Animated.View>
        </View>
      </View>
      
      
      <TouchableOpacity 
        style={[styles.button, spinning && styles.buttonDisabled]} 
        onPress={spinWheel}
        disabled={spinning}
      >
        <Text style={styles.buttonText}>
          {spinning ? "Girando..." : "¡Girar la Rueda!"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  containerOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%', 
    paddingVertical: 5,
  },
  wheelOuterContainer: {
    position: 'relative',
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  wheelContainer: {
    width: '90%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    width: '100%',
    height: '100%',
    
    transformOrigin: 'center',
  },
  markerRight: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{translateY: -10}],
    zIndex: 10,
  },
  button: {
    backgroundColor: appColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    marginTop: 5,
    marginBottom: 10,
    alignSelf: 'center', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default VerticalWheelOfFortune;