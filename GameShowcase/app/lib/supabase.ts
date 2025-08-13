import { createClient } from "@supabase/supabase-js";
import { Database } from "@/app/types/database";

const supabaseUrl = "https://dkoreajsgmrlqvqayzsk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrb3JlYWpzZ21ybHF2cWF5enNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTQ4MTUsImV4cCI6MjA2NDM3MDgxNX0.wt0ntTsWmW3wDbTZVFxJ-v6Nfb9ueyliggY7stNEsMU";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);