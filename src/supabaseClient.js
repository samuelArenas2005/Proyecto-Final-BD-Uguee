import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ragqqxvszpmzryannwrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZ3FxeHZzenBtenJ5YW5ud3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxOTk2NjUsImV4cCI6MjA2Mjc3NTY2NX0.kghWqZUj5X66k534wdE0Ahos6xTKpp-F4qrRVrqvC7I';

export const supabase = createClient(supabaseUrl, supabaseKey);
