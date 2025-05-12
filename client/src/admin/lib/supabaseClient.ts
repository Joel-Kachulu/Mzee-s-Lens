import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rwkalavrqpuwipnbqixd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3a2FsYXZycXB1d2lwbmJxaXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NTM5NjMsImV4cCI6MjA2MjUyOTk2M30.pCaM6z6GptGxohQXHi5EcLKKl0lQkJKWuzsKieocb9o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);










