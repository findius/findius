CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  query TEXT NOT NULL,
  chat_context JSONB,
  content_mdx TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  index_status TEXT DEFAULT 'noindex' CHECK (index_status IN ('noindex', 'index')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_index_status ON pages(index_status);

-- Function to atomically increment page views
CREATE OR REPLACE FUNCTION increment_page_views(page_slug TEXT)
RETURNS VOID AS $$
  UPDATE pages SET views = views + 1 WHERE slug = page_slug;
$$ LANGUAGE sql;
