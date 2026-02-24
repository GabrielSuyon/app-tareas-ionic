import { Injectable } from '@angular/core';
import { supabase } from '../config/supabase.config';
import { Task } from '../models/task.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  // 👇 Esto es como una "caja" que guarda las tareas y avisa cuando cambian
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  private channel: any = null;

  constructor() { }

  // 👇 Inicia la escucha en tiempo real
  startRealtimeListener(userId: string) {
  this.stopRealtimeListener();

  this.channel = supabase
    .channel('tasks-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('🔥 Evento recibido:', payload.eventType, payload);
        this.getTasks(); // getTasks ya filtra por user_id internamente
      }
    )
    .subscribe((status) => {
      console.log('📡 Estado del canal:', status);
    });
}

  // 👇 Detiene la escucha (importante llamarlo al salir)
  stopRealtimeListener() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  async getTasks(): Promise<Task[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('No hay usuario autenticado');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    this.tasksSubject.next(data || []);
    return data || [];
  } catch (error: any) {
    console.log('Error getTasks:', error);
    return [];
  }
}

  // ... el resto de tus métodos quedan igual
  async createTask(task: Task) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('No hay usuario autenticado');

    const { id, ...taskData } = task;
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...taskData, user_id: user.id }])
      .select();  // ✅ AGREGAR .select() para obtener el dato insertado

    if (error) throw error;

    // ✅ RECARGAR TODAS LAS TAREAS DESPUÉS DE CREAR
    await this.getTasks();

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

  async updateTask(id: string, task: Partial<Task>) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...task, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // ✅ RECARGAR TAREAS DESPUÉS DE ACTUALIZAR
    await this.getTasks();

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

  async toggleTask(id: string, done: boolean) {
    return this.updateTask(id, { done });
  }

  async deleteTask(id: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await this.getTasks();
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}