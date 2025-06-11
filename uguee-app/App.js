import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar } from 'react-native';
import Wave from 'react-native-waves';
import homeImage from './assets/homeImage.png';
import Title from './Layouts/Title.js';

// 1. Importaciones de React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 2. Importar las pantallas
import userLoginPage from './pages/userLogin.js'; 
import driverLoginPage from './pages/driverLogin.js'; 

// 3. Crear el "Stack Navigator"
const Stack = createNativeStackNavigator();

// Nota que la pantalla principal recibe la prop "navigation"
const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Title />
      <Text style={styles.subtitulo}>De casa a clase{"\n"}sin complicaciones</Text>
      <Image source={homeImage} style={styles.imagen} resizeMode="contain" />

      <View style={{alignItems: 'center', width: '100%',flexDirection: 'column',zIndex:1}}>
      {/* 4. Botones para navegar a las pantallas de login */}
      {/* Botón de ingreso pasajero */}
      <TouchableOpacity
        style={styles.botonMoradoOscuro}
        // Usa navigation.navigate para ir a la otra pantalla
        // El nombre 'userLogin' debe coincidir con el que se define en el Stack.Screen
        onPress={() => navigation.navigate('userLogin')}
      >
        <Text style={styles.textoBoton}>INGRESO PASAJERO</Text>
      </TouchableOpacity>

      {/* Botón de ingreso de conductor */}
      <TouchableOpacity style={styles.botonMoradoClaro} onPress={() => navigation.navigate('driverLogin')}>
        <Text style={styles.textoBoton}>INGRESAR CONDUCTOR</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.ayuda}>¿Necesitas ayuda?</Text>
      </TouchableOpacity>
      </View>

      <View style={styles.waveContainer}>
        <Wave
    style={{pointerEvents: 'box-none',zIndex:-1}}
      placement="bottom"
      color="#AA00FF"
      // NOTA: Una altura de 1 es casi invisible. La he aumentado a 50 para que se vea mejor.
      // Ajusta este valor según tu preferencia.
      height={1}
      gap={200}
    />
      </View>
    </View>
  );
};


const App = () => {
  StatusBar.setHidden(true);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        // Opcional: para ocultar la barra de título que añade por defecto
        screenOptions={{ headerShown: false }}
      >
        {/* Define las pantallas que puede manejar este navegador */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="userLogin" component={userLoginPage} />
        <Stack.Screen name="driverLogin" component={driverLoginPage} />
        {/* Aquí podrías añadir más pantallas, como: */}
        {/* <Stack.Screen name="DriverLogin" component={DriverLoginPage} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Tus estilos (he simplificado un poco para el ejemplo)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  subtitulo: { fontSize: 26, color: 'gray', textAlign: 'center', marginVertical: 10, paddingBottom: 40 },
  imagen: { width: '100%', height: 200, marginVertical: 20 },
  botonMoradoOscuro: { backgroundColor: '#6A1B9A', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30, marginBottom: 10, width: '100%', alignItems: 'center' },
  botonMoradoClaro: { backgroundColor: '#D500F9', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30, marginBottom: 20, width: '100%', alignItems: 'center' },
  textoBoton: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  ayuda: { fontSize: 14, color: 'gray', backgroundColor: '#F5F5F5', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 10 },
  waveContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, width: '100%', zIndex: 0 }, // zIndex negativo para mandarla al fondo
});

export default App;