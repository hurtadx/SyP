import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RouletteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ruleta de Decisiones</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
  },
});