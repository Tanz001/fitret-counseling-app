import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzbifdxmppcaxrvqtyhg.supabase.co';
const supabaseAnonKey = 'sb_publishable_8rx6-Fnqe3T6NgqJwpO24w_es-IZO8m';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
