// screens/WelcomeScreen.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, ImageBackground, StatusBar, ScrollView } from 'react-native';
import styles from '../styles/styles';
import BackButton from '../components/BackButton';

const fondo = require('../../assets/fondo2.png');
const logo  = require('../../assets/logo.png');
const homeImage = require('../../assets/homeImage.png');

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground source={fondo} style={styles.background} resizeMode="cover">
      <StatusBar barStyle="light-content" />
 
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>De casa a clase{"\n"}sin complicaciones</Text>
        <Image source={homeImage} style={styles.homeImage} resizeMode="contain" />

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.primaryButtonText}>INGRESAR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>REGÍSTRATE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpText}>¿Necesitas ayuda?</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}
