CREATE TABLE affiliate_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                    -- z.B. "Trade Republic", "HUK24"
  category TEXT NOT NULL,                -- z.B. "depot", "haftpflicht", "dsl", "kreditkarte"
  subcategory TEXT,                      -- z.B. "etf-sparplan", "reise-kreditkarte"
  affiliate_url TEXT NOT NULL,           -- Der Affiliate-Link
  affiliate_network TEXT,                -- z.B. "financeAds", "Awin", "Amazon", "direkt"
  logo_url TEXT,                         -- Optional: Logo-URL
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliates_category ON affiliate_partners(category);
CREATE INDEX idx_affiliates_name ON affiliate_partners(name);

-- Public read access (no RLS issues)
ALTER TABLE affiliate_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read affiliates" ON affiliate_partners FOR SELECT USING (true);
CREATE POLICY "Public insert affiliates" ON affiliate_partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update affiliates" ON affiliate_partners FOR UPDATE USING (true);
