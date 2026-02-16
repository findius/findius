import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// --- Affiliate category detection ---
interface AffiliatePartner {
  name: string;
  affiliate_url: string;
  category: string;
  subcategory: string | null;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  depot: ['depot', 'aktien', 'etf', 'sparplan', 'broker', 'wertpapier', 'trading'],
  kreditkarte: ['kreditkarte', 'credit card', 'visa', 'mastercard'],
  haftpflicht: ['haftpflicht', 'haftpflichtversicherung'],
  dsl: ['dsl', 'internet', 'glasfaser', 'breitband', 'wlan', 'router', 'internetanbieter'],
  strom: ['strom', 'stromanbieter', 'stromvergleich', 'energie', 'stromtarif'],
  gas: ['gas', 'gasanbieter', 'gasvergleich', 'gastarif'],
  girokonto: ['girokonto', 'bankkonto', 'konto'],
  versicherung: ['versicherung', 'versichern'],
  handy: ['handy', 'smartphone', 'mobilfunk', 'handyvertrag', 'sim'],
  kredit: ['kredit', 'darlehen', 'finanzierung', 'ratenkredit'],
  tagesgeld: ['tagesgeld', 'festgeld', 'zinsen', 'sparen'],
};

function detectCategory(query: string): string | null {
  const lower = query.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return null;
}

async function loadAffiliatePartners(category: string | null): Promise<AffiliatePartner[]> {
  if (!category) return [];
  const { data } = await supabase
    .from('affiliate_partners')
    .select('name, affiliate_url, category, subcategory')
    .eq('category', category)
    .eq('is_active', true);
  return (data as AffiliatePartner[]) || [];
}

function buildAffiliateContext(partners: AffiliatePartner[]): string {
  if (partners.length === 0) return '';
  const list = partners
    .map((p) => `- ${p.name}: ${p.affiliate_url}${p.subcategory ? ` (${p.subcategory})` : ''}`)
    .join('\n');
  return `\n\nVerfügbare Affiliate-Partner (nutze diese echten Links statt "#" für affiliateLink und AffiliateLink href):\n${list}`;
}

const SYSTEM_PROMPT = `Du bist ein Experte für Vergleichsartikel. Erstelle eine umfassende, informative Vergleichsseite als MDX.

Verfügbare MDX-Komponenten (nutze diese aktiv!):

1. ComparisonTable — Vergleichstabelle:
<ComparisonTable
  title="Titel der Tabelle"
  items={[
    {
      name: "Anbietername",
      features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
      price: "9,99 €/Monat",
      rating: 4.5,
      affiliateLink: "#",
    },
  ]}
/>

2. ProsConsList — Vor- und Nachteile:
<ProsConsList
  title="Anbietername"
  pros={["Vorteil 1", "Vorteil 2", "Vorteil 3"]}
  cons={["Nachteil 1", "Nachteil 2"]}
/>

3. InfoBox — Hinweisboxen (variants: "info", "warning", "tip"):
<InfoBox variant="info" title="Hinweis">
Wichtige Information hier.
</InfoBox>

4. FAQ — Häufige Fragen:
<FAQ
  title="Häufig gestellte Fragen"
  items={[
    {
      question: "Die Frage?",
      answer: "Die Antwort."
    },
  ]}
/>

5. AffiliateLink — Call-to-Action Button:
<AffiliateLink href="https://example.com">
  Jetzt Angebot ansehen
</AffiliateLink>

REGELN:
- Schreibe auf Deutsch, professionell aber verständlich
- Erstelle eine ComparisonTable mit 3-5 realistischen Einträgen
- Nutze h2 (##) und h3 (###) Überschriften zur Strukturierung
- Füge ProsConsList für die Top 2-3 Anbieter hinzu
- Erstelle mindestens eine InfoBox mit hilfreichen Tipps
- Schließe mit einer FAQ-Sektion (3-5 Fragen)
- Schreibe informativen Fließtext zwischen den Komponenten
- Verwende KEINE Frontmatter (---) am Anfang
- Gib REINEN MDX-Inhalt zurück, kein Markdown-Codeblock
- WICHTIG: JSX-Props mit Arrays/Objekten MÜSSEN in geschweiften Klammern stehen! items={[...]} NICHT items=[...]
- Verwende realistische Preise und Bewertungen
- Setze affiliateLink auf "" (leerer String) wenn keine echten Partnerlinks vorhanden sind
- Wenn keine Affiliate-Partner für das Thema existieren, erstelle trotzdem einen informativen Vergleich
- Füge in diesem Fall eine InfoBox hinzu: "Für diesen Bereich bieten wir aktuell keine direkten Partnerlinks an."
- Generiere auch einen Titel und eine kurze Beschreibung für SEO

Antworte im JSON-Format:
{
  "title": "SEO-Titel der Seite",
  "description": "Kurze SEO-Beschreibung (max. 160 Zeichen)",
  "category": "Kategorie (z.B. Finanzen, Versicherungen, Telekommunikation)",
  "content_mdx": "Der vollständige MDX-Inhalt hier..."
}`;

export async function POST(request: Request) {
  try {
    const { query, answers } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const slug = slugify(query);

    // Check if page already exists
    const { data: existingPage } = await supabase
      .from('pages')
      .select('slug')
      .eq('slug', slug)
      .single();

    if (existingPage) {
      return NextResponse.json({ slug: existingPage.slug });
    }

    // Detect category and load affiliate partners
    const category = detectCategory(query);
    const affiliatePartners = await loadAffiliatePartners(category);
    const affiliateContext = buildAffiliateContext(affiliatePartners);

    // Build context from answers
    const contextText = answers?.length
      ? `\n\nNutzerpräferenzen:\n${answers
          .map((a: { question: string; answer: string }) => `- ${a.question}: ${a.answer}`)
          .join('\n')}`
      : '';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Erstelle eine Vergleichsseite zum Thema: "${query}"${contextText}${affiliateContext}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Empty response from AI' },
        { status: 500 }
      );
    }

    const pageData = JSON.parse(content);

    // Fix common AI MDX syntax errors before saving
    if (pageData.content_mdx) {
      pageData.content_mdx = pageData.content_mdx
        // Fix prop=[...] → prop={[...]}
        .replace(/(\w+)=\[/g, '$1={[')
        // Fix ] before /> → ]} before />
        .replace(/\]\s*(\/?>)/g, ']}$1')
        // Fix ] before next prop → ]} before next prop
        .replace(/\]\s+(\w+=)/g, ']} $1')
        // Fix ] at end of line before /> on next line
        .replace(/\]\s*\n(\s*\/?>)/g, ']}\n$1');
    }

    // Save to Supabase
    const { error: insertError } = await supabase.from('pages').insert({
      slug,
      query,
      chat_context: answers || null,
      content_mdx: pageData.content_mdx,
      title: pageData.title,
      description: pageData.description || null,
      category: pageData.category || null,
    });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save page' },
        { status: 500 }
      );
    }

    return NextResponse.json({ slug });
  } catch (error) {
    console.error('generate-page error:', error);
    return NextResponse.json(
      { error: 'Failed to generate page' },
      { status: 500 }
    );
  }
}
