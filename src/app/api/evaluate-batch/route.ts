import { NextRequest, NextResponse } from 'next/server';
import { evaluateProducts } from '@/lib/openai';
import { OpenAIError, trackError } from '@/lib/errors';
import { getCachedData, setCachedData, generateCacheKey } from '@/lib/cache';
import type { ProductDetails } from '@/lib/amazon';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, products, marketplace } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Validation error', message: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Products must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!marketplace?.language) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Marketplace configuration is required' },
        { status: 400 }
      );
    }

    const productsKey = products.map((p: { title: string }) => p.title).join('|');
    const cacheKey = generateCacheKey(
      `eval_batch_${message}_${productsKey}`,
      marketplace.domain
    );

    const cachedResponse = getCachedData(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse);
    }

    const evaluations = await evaluateProducts(message, products, marketplace.language);

    const response = {
      products: products.map((product: ProductDetails, index: number) => ({
        ...product,
        evaluation: evaluations[(index + 1).toString()],
      })),
    };

    setCachedData(cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Batch evaluation error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to evaluate product batch';
    const errorCode = error instanceof OpenAIError ? error.code : 'EVALUATION_ERROR';

    if (error instanceof Error) {
      trackError(error, { endpoint: '/api/evaluate-batch' });
    }

    return NextResponse.json(
      { error: 'AI Service Error', message: errorMessage, code: errorCode },
      { status: 500 }
    );
  }
}
