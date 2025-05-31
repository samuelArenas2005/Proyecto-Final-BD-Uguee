import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput,Button,Switch,ScrollView} from 'react-native';
import { Camera } from 'lucide-react-native';


export default function App() {
  return (
    <View style={styles.container}>
      <Text>Hola miguel xd</Text>
      <TextInput placeholder="Escribe aquí" style={{ borderWidth: 1, padding: 5 }} />
      <Switch value={true} onValueChange={(val) => console.log(val)} />
      <Button title="Presiona aquí" onPress={() => alert("¡Hola!")} />
      <Camera color="red" size={48} />;

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap:20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
