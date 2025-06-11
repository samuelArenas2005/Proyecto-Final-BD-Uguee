import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  StatusBar
} from 'react-native';
import Title from '../Layouts/Title';
import WaveDeco from '../Layouts/Wave';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



const UserLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
    >
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.container}>
            {/* --- SECCIÓN DEL LOGO Y SLOGAN --- */}
            <View style={styles.header}>
                <Title />
                <Text style={styles.slogan}>De casa a clase sin complicaciones</Text>
            </View>

            {/* --- SECCIÓN DEL FORMULARIO --- */}
            <View style={styles.form}>
                {/* Input de Email */}
                <View style={styles.inputContainer}>
                    <Icon name="at" size={22} color="#8A2BE2" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#aaa"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                {/* Input de Contraseña */}
                <View style={styles.inputContainer}>
                    <Icon name="lock-outline" size={22} color="#8A2BE2" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        placeholderTextColor="#aaa"
                        secureTextEntry={true} // Oculta la contraseña
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                {/* Botón de Ingresar */}
                <TouchableOpacity style={styles.loginButton} onPress={() => alert('Intentando ingresar...')}>
                    <Text style={styles.loginButtonText}>INGRESAR</Text>
                </TouchableOpacity>

                {/* Botón de Ayuda */}
                <TouchableOpacity style={styles.helpButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.helpButtonText}>¿Necesitas ayuda?</Text>
                </TouchableOpacity>
            </View>

            {/* --- SECCIÓN DE LA OLA --- */}
            <WaveDeco/>
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-between', // Empuja el contenido y la ola a los extremos
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: '25%', // Un poco de espacio desde arriba
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 70,
    fontWeight: 'bold',
  },
  logoU: {
    color: '#333',
  },
  logoGuee: {
    color: '#D000FF', // Un magenta vibrante como en la imagen
  },
  slogan: {
    fontSize: 18,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 'auto', // Ocupa el espacio disponible empujando la ola
    zIndex:1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 30,
    width: '100%',
    height: 55,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#7A42A8', // El color morado del botón de la imagen
    borderRadius: 30,
    width: '100%',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  helpButton: {
    marginTop: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 25,
  },
  helpButtonText: {
    color: 'gray',
    fontSize: 14,
    fontWeight: '500',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%', // Altura del área de la ola
    width: '100%',
    zIndex: -1, // La mandamos al fondo
  },
});

export default UserLogin;