export type TodoPriority = 'Low' | 'Medium' | 'High';

export type Todo = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  priority: TodoPriority;
  createdAt: string;
  updatedAt: string;
};
