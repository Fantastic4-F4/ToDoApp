import { useMemo, useState } from 'react';
import { Alert, View, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
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

function formatAmPm(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${m} ${ampm}`;
}

export function TodosScreen() {
  const dispatch = useAppDispatch();
  const todos = useAppSelector((state) => state.todos.items);

  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('');
  const [editPriority, setEditPriority] = useState<TodoPriority>('Medium');
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [dateFilter, setDateFilter] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    setEditDueDate(getTodoDate(todo));
    setEditDueTime(todo.dueTime || '');
    setEditPriority(getTodoPriority(todo));
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
        dueDate: editDueDate || editTodo.dueDate,
        dueTime: editDueTime,
        priority: editPriority,
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
    <View className="flex-1 bg-slate-50">
      <Animated.FlatList
        data={visibleTodos}
        itemLayoutAnimation={LinearTransition.springify()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.duration(400)}>
            <Card mode="elevated" style={styles.sortCard}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: '#0f172a', fontWeight: '800', marginBottom: 12 }}>
                Sort & Filter
              </Text>

              <Text variant="labelMedium" style={{ color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
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

              <Text variant="labelMedium" style={{ color: '#64748b', marginBottom: 8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Filter date
              </Text>
              <View className="flex-row items-center mb-4">
                <Button
                  mode="outlined"
                  icon="calendar"
                  onPress={() => setShowDatePicker(true)}
                  style={{ flex: 1, backgroundColor: '#f8fafc', borderColor: '#cbd5e1', marginRight: dateFilter ? 8 : 0, borderRadius: 12 }}
                  textColor="#0f172a"
                  contentStyle={{ justifyContent: 'flex-start', paddingVertical: 6 }}
                >
                  {dateFilter || 'Select specific date'}
                </Button>
                {Boolean(dateFilter) && (
                  <IconButton
                    icon="close-circle"
                    size={24}
                    iconColor="#ef4444"
                    onPress={() => setDateFilter('')}
                    style={{ margin: 0 }}
                  />
                )}
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dateFilter ? new Date(`${dateFilter}T00:00:00`) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const year = selectedDate.getFullYear();
                      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                      const day = String(selectedDate.getDate()).padStart(2, '0');
                      setDateFilter(`${year}-${month}-${day}`);
                    }
                  }}
                />
              )}

              <Text variant="labelMedium" style={{ color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
          </Animated.View>
        }
        ListEmptyComponent={
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <Card mode="elevated" style={styles.emptyCard}>
              <Card.Content style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text variant="headlineSmall" style={{ color: '#0f172a', fontWeight: '700', marginBottom: 8 }}>
                  All Caught Up!
                </Text>
                <Text variant="bodyLarge" style={{ color: '#64748b', textAlign: 'center' }}>
                  You have no tasks matching this criteria. Tap "Add Todo" to create one.
                </Text>
              </Card.Content>
            </Card>
          </Animated.View>
        }
        renderItem={({ item, index }) => (
          <Animated.View 
            entering={FadeInDown.duration(400).delay(index * 50)} 
            exiting={FadeOutUp.duration(300)}
          >
            <Card mode="elevated" style={styles.todoCard}>
              <Card.Content>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text variant="titleLarge" style={{ color: '#0f172a', fontWeight: '800' }}>
                    {item.title}
                  </Text>
                  <Text variant="bodyLarge" style={{ color: '#475569', marginTop: 4, lineHeight: 22 }}>
                    {item.description || 'No description provided'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                    <Chip
                      icon="calendar"
                      compact
                      style={{ backgroundColor: '#f1f5f9' }}
                      textStyle={{ color: '#475569', fontWeight: '600', fontSize: 12 }}
                    >
                      {formatDateOnly(getTodoDate(item))}
                    </Chip>
                    {item.dueTime ? (
                       <Chip
                        icon="clock-outline"
                        compact
                        style={{ backgroundColor: '#f1f5f9' }}
                        textStyle={{ color: '#475569', fontWeight: '600', fontSize: 12 }}
                      >
                        {formatAmPm(item.dueTime)}
                      </Chip>
                    ) : null}
                    <Chip
                      icon={item.priority === 'High' ? 'alert-circle' : 'flag'}
                      compact
                      style={{ 
                        backgroundColor: item.priority === 'High' ? '#ffe4e6' : item.priority === 'Medium' ? '#fef3c7' : '#f1f5f9' 
                      }}
                      textStyle={{ 
                        color: item.priority === 'High' ? '#e11d48' : item.priority === 'Medium' ? '#d97706' : '#475569',
                        fontWeight: '700', fontSize: 12 
                      }}
                    >
                      {getTodoPriority(item)}
                    </Chip>
                  </View>
                </View>

                <View className="flex-col pb-2">
                  <IconButton icon="pencil-outline" size={20} iconColor="#4c1d95" containerColor="#f3e8ff" onPress={() => openEditDialog(item)} />
                  <IconButton
                    icon="trash-can-outline"
                    size={20}
                    iconColor="#e11d48"
                    containerColor="#ffe4e6"
                    onPress={() => handleDelete(item.id)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
          </Animated.View>
        )}
      />

      <Portal>
        <Dialog 
          visible={Boolean(editTodo)} 
          onDismiss={closeEditDialog}
          style={{ backgroundColor: '#ffffff', borderRadius: 24 }}
        >
          <Dialog.Title style={{ color: '#0f172a', fontWeight: '800' }}>Edit Task</Dialog.Title>
          <Dialog.Content style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <TextInput
              label="Task Title"
              mode="outlined"
              value={editTitle}
              onChangeText={setEditTitle}
              outlineColor="#cbd5e1"
              activeOutlineColor="#4c1d95"
              style={{ marginBottom: 16, backgroundColor: '#f8fafc' }}
            />
            <TextInput
              label="Description details"
              mode="outlined"
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              numberOfLines={4}
              outlineColor="#cbd5e1"
              activeOutlineColor="#4c1d95"
              style={{ marginBottom: 16, backgroundColor: '#f8fafc' }}
            />

            <Text variant="labelMedium" style={{ color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Due Date & Time
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <Button
                mode="outlined"
                icon="calendar"
                onPress={() => setShowEditDatePicker(true)}
                style={{ flex: 1, backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderRadius: 12 }}
                textColor="#0f172a"
                contentStyle={{ justifyContent: 'flex-start', paddingVertical: 6 }}
              >
                {editDueDate}
              </Button>
              <Button
                mode="outlined"
                icon="clock-outline"
                onPress={() => setShowEditTimePicker(true)}
                style={{ flex: 1, backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderRadius: 12 }}
                textColor="#0f172a"
                contentStyle={{ justifyContent: 'flex-start', paddingVertical: 6 }}
              >
                {editDueTime ? formatAmPm(editDueTime) : 'None'}
              </Button>
              {editDueTime ? (
                <Button onPress={() => setEditDueTime('')} textColor="#ef4444" style={{ minWidth: 0, paddingHorizontal: 0 }}>
                  Clear
                </Button>
              ) : null}
            </View>

            {showEditTimePicker && (
              <DateTimePicker
                value={editDueTime ? new Date(`${editDueDate || new Date().toISOString().slice(0,10)}T${editDueTime}:00`) : new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEditTimePicker(false);
                  if (selectedDate) {
                    const hh = String(selectedDate.getHours()).padStart(2, '0');
                    const mm = String(selectedDate.getMinutes()).padStart(2, '0');
                    setEditDueTime(`${hh}:${mm}`);
                  }
                }}
              />
            )}

            {showEditDatePicker && (
              <DateTimePicker
                value={editDueDate ? new Date(`${editDueDate}T00:00:00`) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEditDatePicker(false);
                  if (selectedDate) {
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    setEditDueDate(`${year}-${month}-${day}`);
                  }
                }}
              />
            )}

            <Text variant="labelMedium" style={{ color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Priority Level
            </Text>
            <SegmentedButtons
              value={editPriority}
              onValueChange={(value) => setEditPriority(value as TodoPriority)}
              style={{ marginBottom: 24 }}
              theme={{ colors: { secondaryContainer: '#e2e8f0', onSecondaryContainer: '#0f172a' } }}
              buttons={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
              ]}
            />
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
            <Button textColor="#64748b" onPress={closeEditDialog}>Cancel</Button>
            <Button mode="contained" buttonColor="#4c1d95" onPress={handleUpdate}>Save Changes</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  sortCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  todoCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  emptyCard: {
    marginTop: 32,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    shadowColor: 'transparent',
    elevation: 0,
  }
});
