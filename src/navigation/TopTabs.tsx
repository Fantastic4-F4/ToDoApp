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
          tabBarStyle: { backgroundColor: '#b58cff' },
          tabBarLabelStyle: { fontWeight: '700', textTransform: 'none' },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#d5b8f5',
          tabBarIndicatorStyle: { backgroundColor: '#ffd166', height: 4, borderRadius: 2 },
        }}
      >
        <Tab.Screen name="AddTodo" component={AddTodoScreen} options={{ title: 'Add Todo' }} />
        <Tab.Screen name="AllTodos" component={TodosScreen} options={{ title: 'All Todos' }} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
