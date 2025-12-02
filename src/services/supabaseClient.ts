import { createClient } from "@supabase/supabase-js";

// Access environment variables
// Note: Depending on your build tool (Vite, CRA, Next.js), you might need to prefix your .env variables
// (e.g., REACT_APP_..., VITE_..., NEXT_PUBLIC_...) and update the accessors below accordingly.
// Here we assume standard process.env injection.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}
export const isConfigured =
  typeof SUPABASE_URL === "string" &&
  SUPABASE_URL.startsWith("https://") &&
  typeof SUPABASE_ANON_KEY === "string" &&
  SUPABASE_ANON_KEY.length > 0;

// If config is missing, create a safe fallback client to prevent runtime crashes before the check UI renders
export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createClient("https://placeholder.supabase.co", "placeholder");
