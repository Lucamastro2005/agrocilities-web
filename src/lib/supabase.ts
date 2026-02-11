import { createClient } from '@supabase/supabase-js';

// Esto le dice al código: "Andá a leer el archivo .env.local"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);