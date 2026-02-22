import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { ActivityIndicator, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { loadTodos } from './src/features/todos/todosSlice';
import { TopTabsNavigator } from './src/navigation/TopTabs';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { store } from './src/store/store';
import { Todo } from './src/types/todo';

const STORAGE_KEY = 'todoapp.todos.v1';

const paperTheme = {
  ...MD3LightTheme,
  roundness: 16,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1f3c88',
    secondary: '#00c2ff',
    tertiary: '#ff6f61',
    background: '#f0f9ff',
    surface: '#ffffff',
  },
};

const navigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: '#f0f9ff',
    primary: '#1f3c88',
    card: '#b58cff',
    text: '#111827',
    border: '#d1d5db',
  },
};

function AppBootstrap() {
  const dispatch = useAppDispatch();
  const todos = useAppSelector((state) => state.todos.items);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Todo[];
          if (Array.isArray(parsed)) {
            dispatch(loadTodos(parsed));
          }
        }
      } catch (error) {
        console.error('Failed to load todos from storage:', error);
      } finally {
        setIsHydrated(true);
      }
    };

    hydrate();
  }, [dispatch]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos)).catch((error) => {
      console.error('Failed to save todos to storage:', error);
    });
  }, [todos, isHydrated]);

  if (!isHydrated) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#1f3c88" />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="dark" />
        <TopTabsNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider theme={paperTheme}>
        <AppBootstrap />
      </PaperProvider>
    </Provider>
  );
}
