import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddTodoScreen } from '../screens/AddTodoScreen';
import { TodosScreen } from '../screens/TodosScreen';

type RootTopTabParamList = {
  AddTodo: undefined;
  AllTodos: undefined;
};

const Tab = createMaterialTopTabNavigator<RootTopTabParamList>();

export function TopTabsNavigator() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#b58cff' }} edges={['top']}>
      <Tab.Navigator
        initialRouteName="AllTodos"
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#8b5cf6',
            elevation: 10,
            shadowColor: '#4c1d95',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#ffffff',
            height: 3,
            borderRadius: 3,
          },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
          tabBarLabelStyle: {
            fontWeight: '700',
            textTransform: 'uppercase',
            fontSize: 13,
            letterSpacing: 0.5,
          },
        }}
      >
        <Tab.Screen name="AddTodo" component={AddTodoScreen} options={{ title: 'Add Todo' }} />
        <Tab.Screen name="AllTodos" component={TodosScreen} options={{ title: 'All Todos' }} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
