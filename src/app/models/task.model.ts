export interface Task {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
  items: Item[]
}

export interface Item{
    name: string, 
    completed: boolean
}