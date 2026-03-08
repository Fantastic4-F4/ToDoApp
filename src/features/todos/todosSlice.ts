import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Todo, TodoPriority } from '../../types/todo';

type AddTodoPayload = {
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  priority: TodoPriority;
  notificationId?: string;
};

export interface UpdateTodoPayload {
  id: string;
  title?: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority?: TodoPriority;
};

type TodosState = {
  items: Todo[];
};

const initialState: TodosState = {
  items: [],
};

const priorityValues: TodoPriority[] = ['Low', 'Medium', 'High'];

function normalizeDueDate(value: string | undefined, fallbackDate: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return fallbackDate;
  }
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? fallbackDate : value;
}

function normalizePriority(value: string | undefined): TodoPriority {
  if (value && priorityValues.includes(value as TodoPriority)) {
    return value as TodoPriority;
  }
  return 'Medium';
}

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    loadTodos(state, action: PayloadAction<Todo[]>) {
      state.items = action.payload.map((todo) => {
        const fallbackDate = todo.createdAt.slice(0, 10);
        return {
          ...todo,
          dueDate: normalizeDueDate(todo.dueDate, fallbackDate),
          priority: normalizePriority(todo.priority),
        };
      });
    },
    addTodo(state, action: PayloadAction<AddTodoPayload>) {
      const now = new Date().toISOString();
      const todo: Todo = {
        id: Date.now().toString(),
        title: action.payload.title.trim(),
        description: action.payload.description.trim(),
        dueDate: action.payload.dueDate,
        dueTime: action.payload.dueTime,
        priority: action.payload.priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.items.push(todo);
    },
    updateTodo: (state, action: PayloadAction<UpdateTodoPayload>) => {
      const todo = state.items.find((item) => item.id === action.payload.id);
      if (todo) {
        if (action.payload.title !== undefined) todo.title = action.payload.title.trim();
        if (action.payload.description !== undefined) todo.description = action.payload.description.trim();
        if (action.payload.dueDate !== undefined) todo.dueDate = normalizeDueDate(action.payload.dueDate, todo.dueDate);
        if (action.payload.dueTime !== undefined) todo.dueTime = action.payload.dueTime;
        if (action.payload.priority !== undefined) todo.priority = normalizePriority(action.payload.priority);
        todo.updatedAt = new Date().toISOString();
      }
    },
    deleteTodo(state, action: PayloadAction<string>) {
      state.items = state.items.filter((todo) => todo.id !== action.payload);
    },
  },
});

export const { loadTodos, addTodo, updateTodo, deleteTodo } = todosSlice.actions;
export default todosSlice.reducer;
