import React from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet } from 'react-native';

export default function KeyboardAwareOverlay({ style, children }) {
  return (
    <KeyboardAvoidingView
      style={style}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />
      {children}
    </KeyboardAvoidingView>
  );
}
