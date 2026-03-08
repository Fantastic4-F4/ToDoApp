import { useState } from 'react';
import { ScrollView, View, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('Medium');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const isValidDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }
    const parsed = new Date(`${value}T00:00:00`);
    return !Number.isNaN(parsed.getTime());
  };

  const formatAmPm = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  const onAddTodo = async () => {
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
        dueTime,
        priority,
      }),
    );

    setTitle('');
    setDescription('');
    setDueTime('');
    setPriority('Medium');
    setError('');
    setSuccess('Todo added successfully.');
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16 }}>
      <Card mode="elevated" style={styles.formCard}>
        <Card.Content>
          <View className="mb-6 mt-2">
            <Text variant="headlineSmall" style={{ color: '#0f172a', fontWeight: '800' }}>
              New Task
            </Text>
            <Text variant="bodyLarge" style={{ color: '#64748b', marginTop: 4 }}>
              Capture details quickly and stay on track.
            </Text>
          </View>

          <TextInput
            label="Task Title"
            mode="outlined"
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              if (error) setError('');
            }}
            outlineColor="#cbd5e1"
            activeOutlineColor="#4c1d95"
            style={{ marginBottom: 4, backgroundColor: '#f8fafc' }}
          />
          <HelperText type="error" visible={Boolean(error)}>
            {error}
          </HelperText>

          <TextInput
            label="Description details"
            mode="outlined"
            value={description}
            onChangeText={setDescription}
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
              onPress={() => setShowDatePicker(true)}
              style={{ flex: 1, backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderRadius: 12 }}
              textColor="#0f172a"
              contentStyle={{ justifyContent: 'flex-start', paddingVertical: 6 }}
            >
              {dueDate}
            </Button>
            <Button
              mode="outlined"
              icon="clock-outline"
              onPress={() => setShowTimePicker(true)}
              style={{ flex: 1, backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderRadius: 12 }}
              textColor="#0f172a"
              contentStyle={{ justifyContent: 'flex-start', paddingVertical: 6 }}
            >
              {dueTime ? formatAmPm(dueTime) : 'None'}
            </Button>
            {dueTime ? (
              <Button onPress={() => setDueTime('')} textColor="#ef4444" style={{ minWidth: 0, paddingHorizontal: 0 }}>
                Clear
              </Button>
            ) : null}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(`${dueDate}T00:00:00`)}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  // Format as YYYY-MM-DD local time
                  const year = selectedDate.getFullYear();
                  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                  const day = String(selectedDate.getDate()).padStart(2, '0');
                  setDueDate(`${year}-${month}-${day}`);
                  if (error) setError('');
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dueTime ? new Date(`${dueDate}T${dueTime}:00`) : new Date()}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) {
                  const hh = String(selectedDate.getHours()).padStart(2, '0');
                  const mm = String(selectedDate.getMinutes()).padStart(2, '0');
                  setDueTime(`${hh}:${mm}`);
                  if (error) setError('');
                }
              }}
            />
          )}

          <Text variant="labelMedium" style={{ color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Priority Level
          </Text>
          <SegmentedButtons
            value={priority}
            onValueChange={(value) => setPriority(value as TodoPriority)}
            style={{ marginBottom: 24 }}
            theme={{ colors: { secondaryContainer: '#e2e8f0', onSecondaryContainer: '#0f172a' } }}
            buttons={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' },
            ]}
          />

          <Button 
            mode="contained" 
            onPress={onAddTodo} 
            buttonColor="#4c1d95" 
            textColor="#ffffff"
            style={{ borderRadius: 16, paddingVertical: 4 }}
            labelStyle={{ fontWeight: '800', fontSize: 16 }}
          >
            Create Task
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

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    paddingBottom: 8,
  }
});
