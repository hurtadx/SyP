import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GalleryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Nuestras Fotos</Text>
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