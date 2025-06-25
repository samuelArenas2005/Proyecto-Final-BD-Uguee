// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView,ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/styles';
import BackButton from '../components/BackButton';
import { supabase } from '../../supabase';

const logo = require('../../assets/logo.png');
const fondo = require('../../assets/fondo3.png');

export default function LoginScreen({ navigation }) {
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleLogin = async () => {
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (err) setError(err.message);
    else navigation.replace('Home');
  };

  return (
    <ImageBackground source={fondo} style={styles.background} resizeMode="cover">
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <BackButton navigation={navigation} />
      <Image source={logo} style={styles.logoSmall} resizeMode="contain" />
      <Text style={styles.subtitle}>De casa a clase{"\n"}sin complicaciones</Text>

      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color="#AA00FF" style={styles.icon} />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color="#AA00FF" style={styles.icon} />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#999"
          style={styles.input}
          secureTextEntry
          value={pass}
          onChangeText={setPass}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>INGRESAR</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpButton}>
        <Text style={styles.helpText}>¿Necesitas ayuda?</Text>
      </TouchableOpacity>
    </ScrollView>
   </ImageBackground>
  );
}
