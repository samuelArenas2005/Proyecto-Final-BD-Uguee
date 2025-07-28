import { registerRootComponent } from 'expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import App from './App';
import 'react-native-get-random-values'

const Root = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <App />
  </GestureHandlerRootView>
);

registerRootComponent(Root);
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

