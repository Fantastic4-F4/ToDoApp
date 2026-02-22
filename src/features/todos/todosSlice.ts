import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Todo } from '../../types/todo';

type AddTodoPayload = {
  title: string;
  description: string;
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

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    loadTodos(state, action: PayloadAction<Todo[]>) {
      state.items = action.payload;
    },
    addTodo(state, action: PayloadAction<AddTodoPayload>) {
      const now = new Date().toISOString();
      const todo: Todo = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: action.payload.title.trim(),
        description: action.payload.description.trim(),
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
