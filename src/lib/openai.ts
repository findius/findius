import OpenAI from 'openai';
import { searchProducts, type ProductDetails } from './amazon';
import { OpenAIError, trackError } from './errors';

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MessageAnalysis {
  intention: 'product_search' | 'category_search' | 'general_conversation';
  language: string;
  keyword: string | null;
}

export interface ChatResponse {
  message: string;
  analysis: MessageAnalysis;
  products?: ProductDetails[];
  searchTerm?: string;
}

const ANALYZE_PROMPT = `Analyze the following message and conversation history to determine the user's intention and provide:
1. A search keyword for Amazon
2. A brief, friendly introduction (1-2 sentences) that addresses the user's query

Your main task is to maintain context continuity and generate accurate search keywords. This is crucial for follow-up questions.

Guidelines:
1. Always consider the full conversation context when generating keywords
2. For follow-up questions, combine previous product context with new specifications
3. Ensure the keyword is specific enough for Amazon product search
4. Keep the introduction friendly and engaging

Examples:
- Initial: "I'm looking for speakers"
  Follow-up: "Show me very small ones"
  → Keyword should be: "small speakers" or "mini speakers" (NOT "small models")

Return JSON format:
{
  "intention": "product_search" | "category_search" | "general_conversation",
  "language": "detected language code",
  "keyword": "search term combining context and current query",
  "introduction": "Brief, friendly introduction addressing the query"
}`;

const EVALUATE_PROMPT = `You are a helpful and friendly product advisor. Your task is to evaluate the provided products.

Guidelines:
1. Be concise but informative
2. Focus on unique selling points and value for money
3. Consider the user's specific needs and requirements
4. Write in the marketplace language
5. Exclude product prices from evaluations

Provide evaluations in this JSON format:
{
  "evaluations": {
    "1": "Brief evaluation for product 1",
    "2": "Brief evaluation for product 2"
  }
}`;

async function analyzeQuery(
  message: string,
  history: ChatMessage[] = []
): Promise<{ analysis: MessageAnalysis; introduction: string }> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ANALYZE_PROMPT },
        ...history,
        { role: 'user', content: message },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from OpenAI');

    const result = JSON.parse(content) as MessageAnalysis & { introduction: string };
    return {
      analysis: {
        intention: result.intention,
        language: result.language,
        keyword: result.keyword,
      },
      introduction: result.introduction,
    };
  } catch (error) {
    console.error('Query analysis error:', error);
    throw new OpenAIError(
      'Failed to analyze query',
      error instanceof OpenAIError ? error.code : 'ANALYSIS_ERROR'
    );
  }
}

export async function evaluateProducts(
  message: string,
  products: ProductDetails[],
  marketplaceLanguage: string
): Promise<Record<string, string>> {
  try {
    const productsContext = `Based on the user's request: "${message}"\n\nHere are the products to evaluate:\n\n${products
      .map((p, i) => `${i + 1}. ${p.title}, Price: ${p.price}`)
      .join('\n')}`;

    if (!process.env.OPENAI_API_KEY) {
      throw new OpenAIError('OpenAI API key is not configured', 'CONFIG_ERROR');
    }

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: EVALUATE_PROMPT + `\n\nRespond in ${marketplaceLanguage}.`,
        },
        { role: 'user', content: productsContext },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new OpenAIError('Empty evaluation response from OpenAI', 'EMPTY_RESPONSE');
    }

    let result: { evaluations: Record<string, string> };
    try {
      result = JSON.parse(content);
    } catch {
      throw new OpenAIError('Invalid JSON response from OpenAI', 'INVALID_JSON');
    }

    if (!result.evaluations || typeof result.evaluations !== 'object') {
      throw new OpenAIError('Invalid evaluations format from OpenAI', 'INVALID_FORMAT');
    }

    const evaluations: Record<string, string> = {};
    for (let i = 0; i < products.length; i++) {
      const key = (i + 1).toString();
      evaluations[key] = result.evaluations[key] || 'Keine Bewertung verfügbar.';
    }

    return evaluations;
  } catch (error) {
    console.error('Product evaluation error:', error);
    throw new OpenAIError(
      'Failed to evaluate products',
      error instanceof OpenAIError ? error.code : 'EVALUATION_ERROR'
    );
  }
}

export async function chatWithAI(
  message: string,
  history: ChatMessage[] = [],
  marketplaceLanguage: string = 'de_DE'
): Promise<ChatResponse> {
  try {
    const keywordHistory = history.filter(
      (msg) =>
        msg.role === 'user' ||
        (msg.role === 'assistant' && !msg.content.includes('evaluations'))
    );

    const { analysis, introduction } = await analyzeQuery(message, keywordHistory);
    let allProducts: ProductDetails[] | undefined;

    if (analysis.intention !== 'general_conversation' && analysis.keyword) {
      try {
        allProducts = await searchProducts(analysis.keyword);
        console.log(`Found ${allProducts.length} products for "${analysis.keyword}"`);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        if (error instanceof Error) {
          trackError(error, { keyword: analysis.keyword });
        }
      }
    }

    void marketplaceLanguage; // Used for future locale-specific logic

    return {
      message: introduction,
      analysis,
      products: allProducts,
      searchTerm: analysis.keyword || undefined,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new OpenAIError(
      'Failed to get response from AI',
      error instanceof OpenAIError ? error.code : 'CHAT_ERROR'
    );
  }
}
