import { StyleSheet, Text, View, Image, TouchableOpacity, Animated,
    Easing, } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useRef } from 'react';
import * as Svg from 'react-native-svg';
import OlaAnimada from '@/components/ui/ola'; 




export default function HomeScreen() {

  

  return (
    
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloPrimeraLetra}>U</Text>
        <Text style={styles.titulo}>güee</Text>
      </View>

      <Text style={styles.subtitulo}>De casa a clase{"\n"}sin complicaciones</Text>

      <Image
        source={require('@/assets/images/ilustracionInicio.png')} // coloca aquí la imagen
        style={styles.imagen}
        resizeMode="contain"
      />

      <TouchableOpacity style={styles.botonMoradoOscuro}>
        <Text style={styles.textoBoton}>INGRESO PASAJERO</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonMoradoClaro}>
        <Text style={styles.textoBoton}>INGRESAR CONDUCTOR</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.ayuda}> ¿Necesitas ayuda?</Text>
      </TouchableOpacity>


    <OlaAnimada />

      <StatusBar style="auto" />
    </View>
    
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 140,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloPrimeraLetra: {
    fontSize: 70,
    fontWeight: 'bold',
    color: 'black',
  },
  titulo: {
    fontSize: 70,
    fontWeight: 'bold',
    color: '#AA00FF',
  },
  subtitulo: {
    fontSize: 26,
    color: 'gray',
    textAlign: 'center',
    marginVertical: 10,
    paddingTop: 10,
    paddingBottom: 40,
  },
  imagen: {
    width: '100%',
    height: 200,
    marginVertical: 20,
  },
  botonMoradoOscuro: {
    backgroundColor: '#6A1B9A',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  botonMoradoClaro: {
    backgroundColor: '#D500F9',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  textoBoton: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ayuda: {
    fontSize: 14,
    color: 'gray',
    backgroundColor: '#F5F5F5',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  pieDecorativo: {
    position: 'absolute',
    bottom: 0,
    height: 80,
    width: '100%',
    backgroundColor: '#AA00FF',
    borderTopLeftRadius: 40,
  },
    waveFooter: {
    position: 'absolute',
    bottom: 0,
  },



});
const _styles = StyleSheet.create({
    container: {
        flex: 1,
        marginVertical: 10,
        marginHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: StyleSheet.hairlineWidth,
    },
    wave: {
        width: 100,
        aspectRatio: 1,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
    waveBall: {
        width: 100,
        aspectRatio: 1,
        borderRadius: 50,
        overflow: 'hidden',
    }
});

