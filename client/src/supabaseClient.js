import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cjhfueecbjonwzmpockw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaGZ1ZWVjYmpvbnd6bXBvY2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0Nzk4MDksImV4cCI6MjA2NDA1NTgwOX0.8N-UZaK51B2_JRUi-0abIkN-AhLaMJg764vS-uhVgnU";
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
