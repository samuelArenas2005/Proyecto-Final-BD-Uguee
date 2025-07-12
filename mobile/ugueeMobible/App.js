// App.js
import 'react-native-get-random-values';
import 'react-native-gesture-handler'; 
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen   from './src/screens/LoginScreen';
import MapScreen     from './src/screens/MapScreen';

enableScreens();

const Poppins = {
  'Poppins-Regular': require('./assets/Poppins-Regular.ttf'),
  'Poppins-Bold':    require('./assets/Poppins-Bold.ttf'),
};

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadResourcesAndDataAsync = useCallback(async () => {
    try {
      await SplashScreen.preventAutoHideAsync();
      await Font.loadAsync(Poppins);
      setFontsLoaded(true);
    } finally {
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => { loadResourcesAndDataAsync(); }, [loadResourcesAndDataAsync]);
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.flex} pointerEvents="box-none">
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login"   component={LoginScreen} />
            <Stack.Screen name="Home"    component={MapScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
