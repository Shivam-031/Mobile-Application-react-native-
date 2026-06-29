import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './src/store';
import { hydrateCartFromStorage } from './src/store/slices/cartSlice';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/theme';
import notificationService from './src/services/notificationService';

// Suppress known harmless warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize Firebase push notifications
    notificationService.init();

    // Subscribe to eco awareness topic
    notificationService.subscribeToTopic('green_yatra_awareness');
    notificationService.subscribeToTopic('plant_campaigns');

    // Restore any cart the user had before app restart / navigation wipe.
    store.dispatch(hydrateCartFromStorage());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <RootNavigator />
      </Provider>
    </QueryClientProvider>
  );
};

export default App;
