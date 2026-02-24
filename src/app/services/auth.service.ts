import { Injectable } from '@angular/core';
import { supabase } from '../config/supabase.config';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Registrar usuario
  async signUp(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id: data.user.id,
          name: name,
          email: email,
          updated_at: new Date().toISOString()
        }]);

      // ✅ LANZA EL ERROR EN VEZ DE SOLO LOGUEARLO
      if (profileError) throw profileError;
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

  // Iniciar sesión
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Cerrar sesión
  async signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('user'); // ✅ limpia el usuario del localStorage
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
  // Obtener usuario actual
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Obtener perfil de la tabla profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile;
  }

  // Verificar si hay sesión activa
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Actualizar perfil
  async updateProfile(name: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario autenticado');

      const { error } = await supabase
        .from('profiles')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Subir foto de perfil
async uploadProfilePhoto(file: File, userId: string) {
  try {
    const filePath = `${userId}/avatar.jpg`;

    // 👇 Elimina primero si existe
    await supabase.storage
      .from('avatars')
      .remove([filePath]);

    // 👇 Luego sube la nueva
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 👇 Agrega timestamp para forzar recarga de imagen
    const urlWithTimestamp = `${data.publicUrl}?t=${new Date().getTime()}`;

    await supabase
      .from('profiles')
      .update({ photo_url: urlWithTimestamp, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return { success: true, url: urlWithTimestamp };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
// Actualizar nombre
async updateName(name: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay usuario autenticado');

    const { error } = await supabase
      .from('profiles')
      .update({ name, updated_at: new Date().toISOString() }) // 👈 update en vez de upsert
      .eq('id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Actualizar contraseña
async updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Obtener perfil completo
async getProfile(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile ? { ...profile, email: user.email } : null;
  } catch {
    return null;
  }
}

async updateEmail(newEmail: string) {
  try {
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: 'http://localhost:8100/auth-callback' } // 👈 cambia esto
    );
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

}