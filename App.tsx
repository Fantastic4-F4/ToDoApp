import { useEffect, useState } from 'react';
import { View, Text as RNText } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { ActivityIndicator, MD3LightTheme, PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loadTodos } from './src/features/todos/todosSlice';
import { TopTabsNavigator } from './src/navigation/TopTabs';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import { store } from './src/store/store';
import { Todo } from './src/types/todo';

const STORAGE_KEY = 'todoapp.todos.v1';

const paperTheme = {
  ...MD3LightTheme,
  roundness: 24,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4c1d95',
    secondary: '#8b5cf6',
    tertiary: '#f43f5e',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceVariant: '#f1f5f9',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#f8fafc',
      level2: '#f1f5f9',
      level3: '#e2e8f0',
      level4: '#cbd5e1',
      level5: '#94a3b8',
    },
  },
};

const navigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: '#f8fafc',
    primary: '#4c1d95',
    card: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
  },
};

function AppHeader() {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={['#4c1d95', '#7c3aed', '#8b5cf6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 16,
        paddingHorizontal: 16,
        zIndex: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 10, borderRadius: 16, marginRight: 12 }}>
          <MaterialCommunityIcons name="check-decagram" size={28} color="#ffffff" />
        </View>
        <View>
          <Text variant="headlineMedium" style={{ color: '#ffffff', fontWeight: '900', letterSpacing: 0.5 }}>
            TaskMaster
          </Text>
          <Text variant="titleSmall" style={{ color: '#e2e8f0', opacity: 0.9, marginTop: -4 }}>
            Organize brilliantly
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

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
        <StatusBar style="light" />
        <AppHeader />
        <View style={{ flex: 1 }}>
          <TopTabsNavigator />
        </View>
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
