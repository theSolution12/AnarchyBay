// DEPENDENCIES
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:");
  if (!supabaseUrl) console.error("  - SUPABASE_URL is not defined");
  if (!supabaseAnonKey) console.error("  - SUPABASE_ANON_KEY is not defined");
  console.warn(
    "Continuing without Supabase client; Supabase-dependent features will be disabled.",
  );
}

console.log("Supabase URL:", supabaseUrl ? "Loaded" : "Not Loaded");
console.log(
  "Supabase Anon Key:",
  supabaseAnonKey ? "Loaded (anon)" : "Not Loaded",
);
console.log(
  "Supabase Service Key:",
  supabaseServiceKey ? "Loaded (service)" : "Not Loaded",
);

// Prefer service role key on server for authorized operations, fallback to anon key
export let supabase = null;
export let supabaseAdmin = null;
if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
  const keyToUse = supabaseServiceKey || supabaseAnonKey;
  supabase = createClient(supabaseUrl, keyToUse);

  supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : supabase;
} else {
  // Clients remain null when configuration is missing
  supabase = null;
  supabaseAdmin = null;
}

export const handleSupabaseError = (res, error) => {
  const status = error.status || 400;
  return res.status(status).json({
    error: error.message || "Authentication error",
  });
};
