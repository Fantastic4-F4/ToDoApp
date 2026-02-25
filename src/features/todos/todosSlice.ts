import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Todo, TodoPriority } from '../../types/todo';

type AddTodoPayload = {
  title: string;
  description: string;
  dueDate: string;
  priority: TodoPriority;
};

type UpdateTodoPayload = {
  id: string;
  title: string;
  description: string;
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
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: action.payload.title.trim(),
        description: action.payload.description.trim(),
        dueDate: normalizeDueDate(action.payload.dueDate, now.slice(0, 10)),
        priority: normalizePriority(action.payload.priority),
        createdAt: now,
        updatedAt: now,
      };
      state.items.push(todo);
    },
    updateTodo(state, action: PayloadAction<UpdateTodoPayload>) {
      const item = state.items.find((todo) => todo.id === action.payload.id);
      if (!item) {
        return;
      }
      item.title = action.payload.title.trim();
      item.description = action.payload.description.trim();
      item.updatedAt = new Date().toISOString();
    },
    deleteTodo(state, action: PayloadAction<string>) {
      state.items = state.items.filter((todo) => todo.id !== action.payload);
    },
  },
});

export const { loadTodos, addTodo, updateTodo, deleteTodo } = todosSlice.actions;
export default todosSlice.reducer;
