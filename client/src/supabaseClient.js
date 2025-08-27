import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nmiznyazvqwsxwyywtjg.supabase.co";
const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taXpueWF6dnF3c3h3eXl3dGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzI4MTEsImV4cCI6MjA3MTgwODgxMX0.LIQQX6b9OR0b7e1z0bU1vqrUVPQd_D1YAQYWig20suw";
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
