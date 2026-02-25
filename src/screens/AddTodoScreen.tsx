import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { Button, Card, Dialog, HelperText, Portal, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useAppDispatch } from '../store/hooks';
import { addTodo } from '../features/todos/todosSlice';
import type { TodoPriority } from '../types/todo';

type RootTopTabParamList = {
  AddTodo: undefined;
  AllTodos: undefined;
};

export function AddTodoScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<MaterialTopTabNavigationProp<RootTopTabParamList>>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  });
  const [priority, setPriority] = useState<TodoPriority>('Medium');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isValidDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }
    const parsed = new Date(`${value}T00:00:00`);
    return !Number.isNaN(parsed.getTime());
  };

  const onAddTodo = () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!isValidDate(dueDate)) {
      setError('Date must be in YYYY-MM-DD format');
      return;
    }

    dispatch(
      addTodo({
        title,
        description,
        dueDate,
        priority,
      }),
    );

    setTitle('');
    setDescription('');
    setPriority('Medium');
    setError('');
    setSuccess('Todo added successfully.');
  };

  return (
    <ScrollView className="flex-1 bg-lemon/20" contentContainerStyle={{ padding: 16 }}>
      <Card mode="contained" style={{ backgroundColor: '#ffffff' }}>
        <Card.Content>
          <View className="mb-4">
            <Text variant="headlineSmall" style={{ color: '#1f3c88', fontWeight: '700' }}>
              Add a Todo
            </Text>
            <Text variant="bodyMedium" style={{ color: '#4b5563' }}>
              Capture tasks quickly and keep your day organized.
            </Text>
          </View>

          <TextInput
            label="Title"
            mode="outlined"
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              if (error) setError('');
            }}
            style={{ marginBottom: 8, backgroundColor: '#f8fbff' }}
          />
          <HelperText type="error" visible={Boolean(error)}>
            {error}
          </HelperText>

          <TextInput
            label="Description"
            mode="outlined"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ marginBottom: 12, backgroundColor: '#f8fbff' }}
          />

          <TextInput
            label="Date (YYYY-MM-DD)"
            mode="outlined"
            value={dueDate}
            onChangeText={(value) => {
              setDueDate(value);
              if (error) setError('');
            }}
            style={{ marginBottom: 12, backgroundColor: '#f8fbff' }}
          />

          <Text variant="labelLarge" style={{ color: '#1f2937', marginBottom: 8 }}>
            Priority
          </Text>
          <SegmentedButtons
            value={priority}
            onValueChange={(value) => setPriority(value as TodoPriority)}
            style={{ marginBottom: 16 }}
            buttons={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' },
            ]}
          />

          <Button mode="contained" onPress={onAddTodo} buttonColor="#00c2ff" textColor="#082f49">
            Save Todo
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog
          visible={Boolean(success)}
          dismissable={false}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.54)',
            borderWidth: 1,
            borderColor: 'rgba(255, 4, 4, 0.57)',
            borderRadius: 18,
            shadowColor: '#00ff84cc',
            shadowOpacity: 0.45,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 14,
          }}
        >
          <Dialog.Title style={{ textAlign: 'center', color: '#ffffff' }}>Success</Dialog.Title>
          <Dialog.Content style={{ alignItems: 'center' }}>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#f3f4f6' }}>
              {success}
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: 'center' }}>
            <Button
              mode="contained"
              buttonColor="#111827"
              textColor="#ffffff"
              onPress={() => {
                setSuccess('');
                navigation.navigate('AllTodos');
              }}
            >
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
