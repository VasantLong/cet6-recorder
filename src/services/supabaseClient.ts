
import { createClient } from '@supabase/supabase-js';

// TODO: REPLACE THESE WITH YOUR OWN SUPABASE PROJECT CREDENTIALS
// You can find these in your Supabase Dashboard -> Settings -> API
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

export const isConfigured = 
  SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' && 
  SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
