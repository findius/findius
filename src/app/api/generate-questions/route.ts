import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Du bist ein Experte für Produktvergleiche, Finanzberatung und Tarifvergleiche in Deutschland.

Der Nutzer möchte einen Vergleich erstellen. Basierend auf seinem Thema, generiere 2-3 kurze, relevante Rückfragen, die helfen, den Vergleich zu personalisieren.

Jede Frage sollte 3-4 Auswahlmöglichkeiten haben. Die Fragen sollen dem Nutzer helfen, das beste Ergebnis für seine spezifische Situation zu finden.

Beispiel für "Depot für ETF-Sparpläne":
- Frage: "Wie viel möchtest du monatlich investieren?"
  Optionen: ["Unter 50 €", "50-200 €", "200-500 €", "Über 500 €"]
- Frage: "Was ist dir am wichtigsten?"
  Optionen: ["Niedrige Gebühren", "Große ETF-Auswahl", "Gute App", "Vollbank-Service"]

Antworte ausschließlich im JSON-Format:
{
  "questions": [
    {
      "text": "Die Frage",
      "options": ["Option 1", "Option 2", "Option 3"]
    }
  ]
}`;

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Thema: ${query}` },
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

    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch (error) {
    console.error('generate-questions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
