/**
 * GREEN YATRA INDIA — React Native Entry Point
 * This file is the bridge between native (android/ios) and JavaScript.
 * The AppRegistry.registerComponent call must match the app name in app.json.
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
