import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://clufybkujyzhzffpymti.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdWZ5Ymt1anl6aHpmZnB5bXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4Nzg4NjEsImV4cCI6MjEwNjQ1NDg2MX0.xsqLUK3RI5S7M2I_lR-QStUScCye3WcPK4-VbDTJtvQ';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
