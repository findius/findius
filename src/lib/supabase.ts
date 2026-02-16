import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Page {
  id: string;
  slug: string;
  query: string;
  chat_context: { question: string; answer: string }[] | null;
  content_mdx: string;
  title: string;
  description: string | null;
  category: string | null;
  index_status: 'noindex' | 'index';
  views: number;
  created_at: string;
  updated_at: string;
}
