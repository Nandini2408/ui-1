// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://narlejmxxolzjesxfbzg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcmxlam14eG9semplc3hmYnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODMwODcsImV4cCI6MjA2NTQ1OTA4N30.77i7LVcACBNvEao2i_DxAj4NseTFz2xJB1as5HpeiFQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);