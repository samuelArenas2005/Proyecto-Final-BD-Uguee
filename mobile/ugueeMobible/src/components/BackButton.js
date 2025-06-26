
import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BackButton({ navigation }) {
  if (!navigation.canGoBack()) return null;
  return (
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Ionicons name="chevron-back" size={24} color="#AA00FF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: Platform.select({ ios: 50, android: 20 }),
    left: SCREEN_WIDTH * 0.05,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
  },
});
