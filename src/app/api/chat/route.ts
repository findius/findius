import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/openai';
import { OpenAIError, trackError } from '@/lib/errors';
import { getCachedData, setCachedData, generateCacheKey } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      history = [],
      marketplace = { domain: 'www.amazon.de', language: 'de_DE' },
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Message is required' },
        { status: 400 }
      );
    }

    const cacheKey = generateCacheKey(message, marketplace.domain);
    const cachedResponse = getCachedData(cacheKey);
    if (cachedResponse) {
      console.log('Cache hit for query:', message);
      return NextResponse.json(cachedResponse);
    }

    const response = await chatWithAI(message, history, marketplace.language);

    const responseData = {
      message: response.message,
      analysis: response.analysis,
      products: response.products?.map((p) => ({ ...p, evaluation: null })),
      history: [
        ...history,
        { role: 'user', content: message },
        { role: 'assistant', content: response.message },
      ],
    };

    setCachedData(cacheKey, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    if (error instanceof OpenAIError) {
      return NextResponse.json(
        { error: 'AI Service Error', message: error.message, code: error.code },
        { status: error.status }
      );
    }

    const userMessage = trackError(error as Error, {
      endpoint: '/api/chat',
    });

    return NextResponse.json(
      { error: 'Internal Server Error', message: userMessage },
      { status: 500 }
    );
  }
}
