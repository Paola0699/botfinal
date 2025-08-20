import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mdyzrvqztglbiuloyhib.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keXpydnF6dGdsYml1bG95aGliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExNzU4NywiZXhwIjoyMDcwNjkzNTg3fQ.FT7nfaBbE7QvVexGoXVI8OortaITkNsPRJhrMk0yIWo";
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
