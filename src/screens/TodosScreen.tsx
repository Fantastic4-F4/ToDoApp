import { useMemo, useState } from 'react';
import { Alert, SectionList, View } from 'react-native';
import { Button, Card, Dialog, IconButton, Portal, Text, TextInput } from 'react-native-paper';
import { deleteTodo, updateTodo } from '../features/todos/todosSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Todo } from '../types/todo';

type TodoSection = {
  title: string;
  data: Todo[];
};

function getDateLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function TodosScreen() {
  const dispatch = useAppDispatch();
  const todos = useAppSelector((state) => state.todos.items);

  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const sections = useMemo<TodoSection[]>(() => {
    const sorted = [...todos].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const grouped = sorted.reduce<Record<string, Todo[]>>((acc, todo) => {
      const dateLabel = getDateLabel(todo.createdAt);
      if (!acc[dateLabel]) {
        acc[dateLabel] = [];
      }
      acc[dateLabel].push(todo);
      return acc;
    }, {});

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [todos]);

  const openEditDialog = (todo: Todo) => {
    setEditTodo(todo);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
  };

  const closeEditDialog = () => {
    setEditTodo(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleUpdate = () => {
    if (!editTodo || !editTitle.trim()) {
      return;
    }

    dispatch(
      updateTodo({
        id: editTodo.id,
        title: editTitle,
        description: editDescription,
      }),
    );

    closeEditDialog();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Todo', 'This action cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch(deleteTodo(id)),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-aqua/10">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListEmptyComponent={
          <Card mode="contained" style={{ backgroundColor: '#ffffff' }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: '#1f2937' }}>
                No todos yet
              </Text>
              <Text variant="bodyMedium" style={{ color: '#6b7280' }}>
                Add your first task from the Add Todo tab.
              </Text>
            </Card.Content>
          </Card>
        }
        renderSectionHeader={({ section }) => (
          <Text
            variant="titleSmall"
            style={{ marginTop: 8, marginBottom: 8, color: '#1f3c88', fontWeight: '700' }}
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <Card mode="contained" style={{ marginBottom: 12, backgroundColor: '#ffffff' }}>
            <Card.Content>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text variant="titleMedium" style={{ color: '#111827', fontWeight: '700' }}>
                    {item.title}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: '#4b5563', marginTop: 2 }}>
                    {item.description || 'No description'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#6b7280', marginTop: 8 }}>
                    Created at {formatTime(item.createdAt)}
                  </Text>
                </View>

                <View className="flex-row">
                  <IconButton icon="pencil" iconColor="#1f3c88" onPress={() => openEditDialog(item)} />
                  <IconButton
                    icon="delete"
                    iconColor="#ef4444"
                    onPress={() => handleDelete(item.id)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <Portal>
        <Dialog visible={Boolean(editTodo)} onDismiss={closeEditDialog}>
          <Dialog.Title>Edit Todo</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              mode="outlined"
              value={editTitle}
              onChangeText={setEditTitle}
              style={{ marginBottom: 12, backgroundColor: '#f8fbff' }}
            />
            <TextInput
              label="Description"
              mode="outlined"
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              numberOfLines={4}
              style={{ backgroundColor: '#f8fbff' }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeEditDialog}>Cancel</Button>
            <Button onPress={handleUpdate}>Update</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
