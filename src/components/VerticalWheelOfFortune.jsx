import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
import { appColors } from '../utils/colors';

const MAX_LABEL_LENGTH = 12;

const shortenLabel = (label) =>
  label.length > MAX_LABEL_LENGTH ? `${label.slice(0, MAX_LABEL_LENGTH - 1)}…` : label;

const VerticalWheelOfFortune = ({ options = [], colors = [], size = 300, onFinish }) => {
  const [spinning, setSpinning] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const totalRotation = useRef(0);

  const wheelOptions = options;

  const wheelColors = colors.length > 0 ? colors : [
    "#FF5252", "#FF7752", "#FFB752", "#FFE652",
    "#B4FF52", "#52FF9A", "#52FFFF", "#5286FF",
    "#A952FF", "#FF52B4"
  ];

  const centerX = size / 2;
  const centerY = size / 2;
  const wheelRadius = size * 0.47;
  const fontSize = wheelOptions.length > 12 ? 10 : wheelOptions.length > 8 ? 12 : 14;

  const spinWheel = () => {
    if (spinning || wheelOptions.length < 2) return;

    setSpinning(true);

    totalRotation.current += 1440 + Math.floor(Math.random() * 1440);

    Animated.timing(spinValue, {
      toValue: totalRotation.current / 360,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(() => {
      const degrees = totalRotation.current % 360;
      const optionIndex = Math.floor((360 - degrees) / (360 / wheelOptions.length));
      const winnerText = wheelOptions[optionIndex % wheelOptions.length];

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
      <View style={{ width: size, height: size }}>
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
                        y={centerY - wheelRadius * 0.6}
                        fill="white"
                        fontWeight="bold"
                        fontSize={fontSize}
                        textAnchor="middle"
                        rotation={90}
                        originX={centerX}
                        originY={centerY - wheelRadius * 0.6}
                      >
                        {shortenLabel(option)}
                      </SvgText>
                    </G>
                  </G>
                );
              })}
            </Svg>
          </Animated.View>
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
    width: '100%',
  },
  markerRight: {
    position: 'absolute',
    right: -14,
    top: '50%',
    transform: [{translateY: -10}],
    zIndex: 10,
    elevation: 10,
  },
  button: {
    backgroundColor: appColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    marginTop: 15,
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