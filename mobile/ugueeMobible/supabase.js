// supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL    = 'https://mhcmcwxhaqserowctars.supabase.co';
const SUPABASE_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oY21jd3hoYXFzZXJvd2N0YXJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODIxNzExMiwiZXhwIjoyMDYzNzkzMTEyfQ.BgTlypyMRcxW2x2FdCso9_r17LfvjyqOV4-nwEYkQWI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
