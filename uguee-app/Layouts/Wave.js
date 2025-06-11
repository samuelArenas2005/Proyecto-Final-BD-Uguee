import React from "react";
import { View, StyleSheet} from 'react-native';
import Wave from 'react-native-waves';


const WaveDeco=()=>{
    return(
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
    );
    
}
const styles = StyleSheet.create({
       waveContainer: {
        position: 'absolute', // Saca el elemento del flujo normal
        bottom: 0,           // Lo pega a la parte inferior
        left: 0,             // Lo estira de izquierda...
        right: 0,            // ...a derecha
        height: 100,         // Altura del contenedor de la ola
        width: '100%',
        backgroundColor: 'green',
        // Es importante que no tenga flex: 1
        pointerEvents: 'box-none', // Permite que los toques "atraviesen" este contenedor
        zIndex: 0, // Asegura que la ola esté detrás de otros elementos
        },
    })
export default WaveDeco;