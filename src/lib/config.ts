// Environment variables are injected by Vite
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || "https://narlejmxxolzjesxfbzg.supabase.co",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcmxlam14eG9semplc3hmYnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODMwODcsImV4cCI6MjA2NTQ1OTA4N30.77i7LVcACBNvEao2i_DxAj4NseTFz2xJB1as5HpeiFQ"
}; 