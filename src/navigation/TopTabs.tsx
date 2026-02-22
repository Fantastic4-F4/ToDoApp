import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { AddTodoScreen } from '../screens/AddTodoScreen';
import { TodosScreen } from '../screens/TodosScreen';

type RootTopTabParamList = {
  AddTodo: undefined;
  AllTodos: undefined;
};

const Tab = createMaterialTopTabNavigator<RootTopTabParamList>();

export function TopTabsNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="AddTodo"
      screenOptions={{
        tabBarStyle: { backgroundColor: '#b58cff' },
        tabBarLabelStyle: { fontWeight: '700', textTransform: 'none' },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#f3e8ff',
        tabBarIndicatorStyle: { backgroundColor: '#ffd166', height: 4, borderRadius: 2 },
      }}
    >
      <Tab.Screen name="AddTodo" component={AddTodoScreen} options={{ title: 'Add Todo' }} />
      <Tab.Screen name="AllTodos" component={TodosScreen} options={{ title: 'All Todos' }} />
    </Tab.Navigator>
  );
}
