import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import SplashScreen from '../screens/splash/SplashScreen';
import { fetchCurrentUser } from '../store/slices/authSlice';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
