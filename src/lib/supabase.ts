import { createClient } from "@supabase/supabase-js";

// Publishable key is *designed* to be exposed to the browser — it's gated by
// RLS, not secrecy. Baked-in defaults so `.env.local` is optional in dev.
// Override in production via Vercel env vars.
const DEFAULT_URL = "https://gvtrfbhnldbstitdmrqi.supabase.co";
const DEFAULT_KEY = "sb_publishable_IOPfkhpEHa_SSp5UclmnkA_9DDwUcSw";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
