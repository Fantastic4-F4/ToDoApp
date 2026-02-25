import { useMemo, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  Dialog,
  HelperText,
  IconButton,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';
import { deleteTodo, updateTodo } from '../features/todos/todosSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Todo, TodoPriority } from '../types/todo';

type SortBy = 'date' | 'priority';
type PriorityFilter = 'All' | TodoPriority;
const priorityRank: Record<TodoPriority, number> = { High: 0, Medium: 1, Low: 2 };

function getTodoDate(todo: Todo): string {
  return todo.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(todo.dueDate)
    ? todo.dueDate
    : todo.createdAt.slice(0, 10);
}

function getTodoPriority(todo: Todo): TodoPriority {
  return todo.priority ?? 'Medium';
}

function isValidDateFilter(value: string): boolean {
  if (!value) {
    return true;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

function formatDateOnly(dateValue: string): string {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TodosScreen() {
  const dispatch = useAppDispatch();
  const todos = useAppSelector((state) => state.todos.items);

  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [dateFilter, setDateFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');

  const isDateFilterValid = isValidDateFilter(dateFilter);

  const visibleTodos = useMemo(() => {
    const filtered = todos.filter((todo) => {
      const todoDate = getTodoDate(todo);
      const todoPriority = getTodoPriority(todo);
      const byDate = !dateFilter || (isDateFilterValid && todoDate === dateFilter);
      const byPriority = priorityFilter === 'All' || todoPriority === priorityFilter;
      return byDate && byPriority;
    });

    return filtered.sort((a, b) => {
      const dateCompare =
        new Date(`${getTodoDate(a)}T00:00:00`).getTime() -
        new Date(`${getTodoDate(b)}T00:00:00`).getTime();

      if (sortBy === 'date') {
        return dateCompare;
      }

      const priorityCompare = priorityRank[getTodoPriority(a)] - priorityRank[getTodoPriority(b)];
      return priorityCompare !== 0 ? priorityCompare : dateCompare;
    });
  }, [dateFilter, isDateFilterValid, priorityFilter, sortBy, todos]);

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
      <FlatList
        data={visibleTodos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListHeaderComponent={
          <Card mode="contained" style={{ marginBottom: 12, backgroundColor: '#ffffff' }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: '#1f2937', fontWeight: '700', marginBottom: 10 }}>
                Sort and Filter
              </Text>

              <Text variant="labelLarge" style={{ color: '#374151', marginBottom: 8 }}>
                Sort by
              </Text>
              <SegmentedButtons
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortBy)}
                style={{ marginBottom: 12 }}
                buttons={[
                  { value: 'date', label: 'Date' },
                  { value: 'priority', label: 'Priority' },
                ]}
              />

              <TextInput
                label="Filter date (YYYY-MM-DD)"
                mode="outlined"
                value={dateFilter}
                onChangeText={setDateFilter}
                style={{ marginBottom: 4, backgroundColor: '#f8fbff' }}
              />
              <HelperText type="error" visible={!isDateFilterValid}>
                Enter date in YYYY-MM-DD format
              </HelperText>

              <Text variant="labelLarge" style={{ color: '#374151', marginBottom: 8 }}>
                Filter by priority
              </Text>
              <SegmentedButtons
                value={priorityFilter}
                onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}
                style={{ marginBottom: 4 }}
                buttons={[
                  { value: 'All', label: 'All' },
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' },
                ]}
              />
            </Card.Content>
          </Card>
        }
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
                    Date: {formatDateOnly(getTodoDate(item))}
                  </Text>
                  <Chip
                    compact
                    style={{ alignSelf: 'flex-start', marginTop: 8 }}
                    textStyle={{ fontWeight: '700' }}
                  >
                    Priority: {getTodoPriority(item)}
                  </Chip>
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
