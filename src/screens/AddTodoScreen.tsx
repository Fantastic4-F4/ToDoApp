import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { useAppDispatch } from '../store/hooks';
import { addTodo } from '../features/todos/todosSlice';

export function AddTodoScreen() {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const onAddTodo = () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    dispatch(
      addTodo({
        title,
        description,
      }),
    );

    setTitle('');
    setDescription('');
    setError('');
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
            style={{ marginBottom: 16, backgroundColor: '#f8fbff' }}
          />

          <Button mode="contained" onPress={onAddTodo} buttonColor="#00c2ff" textColor="#082f49">
            Save Todo
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
