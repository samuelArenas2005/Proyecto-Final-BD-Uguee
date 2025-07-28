import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScanning(false);
    Alert.alert("QR Escaneado", `Tipo: ${type}\nContenido: ${data}`);
  };

  if (hasPermission === null) {
    return <Text style={styles.message}>Solicitando permiso para la cámara...</Text>;
  }

  if (hasPermission === false) {
    return <Text style={styles.message}>Permiso denegado para la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      {!scanning && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setScanned(false);
            setScanning(true);
          }}
        >
          <Text style={styles.buttonText}>📷 Escanear código QR</Text>
        </TouchableOpacity>
      )}

      {scanning && (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          type={Camera?.Constants?.Type?.back ?? 'back'}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: Camera?.Constants?.BarCodeType
              ? [Camera.Constants.BarCodeType.qr]
              : undefined,
          }}
        >
          <View style={styles.overlay}>
            <Text style={styles.instruction}>Apunta al código QR</Text>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setScanning(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 50,
    color: 'white',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  instruction: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#ff5555',
    padding: 12,
    borderRadius: 10,
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
  },
});
