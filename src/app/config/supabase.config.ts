import { createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    }
  }

  //Base de Datos 

);