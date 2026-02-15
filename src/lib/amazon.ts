import axios from 'axios';
import { AmazonAPIError } from './errors';

export interface ProductDetails {
  title: string;
  imageUrl: string;
  price: string;
  detailUrl: string;
  starRating?: number;
  reviewCount?: number;
  evaluation?: string;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

class AmazonService {
  private credentialId: string;
  private credentialSecret: string;
  private partnerTag: string;
  private apiVersion: string;
  private marketplace = 'www.amazon.de';
  private tokenEndpoint = 'https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token';
  private searchEndpoint = 'https://creatorsapi.amazon/catalog/v1/searchItems';
  private lastRequestTime = 0;
  private minRequestInterval = 1000;
  private tokenCache: TokenCache | null = null;

  constructor() {
    this.credentialId = process.env.AMAZON_ACCESS_KEY || '';
    this.credentialSecret = process.env.AMAZON_SECRET_KEY || '';
    this.partnerTag = process.env.AMAZON_PARTNER_TAG || 'findius-21';
    const rawVersion = process.env.AMAZON_API_VERSION || '2.2';
    this.apiVersion = rawVersion.replace(/^v/, '');
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minRequestInterval) {
      await this.delay(this.minRequestInterval - elapsed);
    }
    this.lastRequestTime = Date.now();
  }

  private async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt - 60_000) {
      return this.tokenCache.token;
    }

    const credentials = Buffer.from(
      `${this.credentialId}:${this.credentialSecret}`
    ).toString('base64');

    try {
      const response = await axios.post(
        this.tokenEndpoint,
        'grant_type=client_credentials&scope=creatorsapi/default',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
          timeout: 10000,
        }
      );

      const { access_token, expires_in } = response.data;

      this.tokenCache = {
        token: access_token,
        expiresAt: Date.now() + expires_in * 1000,
      };

      console.log(`OAuth token acquired, expires in ${expires_in}s`);
      return access_token;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      console.error('Failed to obtain OAuth token:', err.response?.data || err.message);
      throw new AmazonAPIError(
        'Failed to authenticate with Amazon Creators API: ' +
          (err.response?.data?.error || err.message),
        'AUTH_ERROR'
      );
    }
  }

  async searchProducts(keywords: string): Promise<ProductDetails[]> {
    try {
      if (!this.credentialId || !this.credentialSecret || !this.partnerTag) {
        const missing = [];
        if (!this.credentialId) missing.push('Credential ID');
        if (!this.credentialSecret) missing.push('Credential Secret');
        if (!this.partnerTag) missing.push('Partner Tag');
        throw new AmazonAPIError(
          `Missing credentials: ${missing.join(', ')}`,
          'MISSING_CREDENTIALS'
        );
      }

      await this.enforceRateLimit();
      const token = await this.getAccessToken();

      const payload = {
        keywords,
        resources: [
          'images.primary.large',
          'itemInfo.title',
          'itemInfo.features',
          'itemInfo.productInfo',
          'customerReviews.count',
          'customerReviews.starRating',
        ],
        partnerTag: this.partnerTag,
        partnerType: 'Associates',
        marketplace: this.marketplace,
        searchIndex: 'All',
        itemCount: 10,
        availability: 'Available',
        condition: 'New',
      };

      const response = await axios.post(this.searchEndpoint, payload, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}, Version ${this.apiVersion}`,
          'x-marketplace': this.marketplace,
        },
        timeout: 10000,
      });

      if (response.data?.searchResult?.items) {
        return response.data.searchResult.items.map((item: Record<string, unknown>) => {
          const itemInfo = item.itemInfo as Record<string, unknown> | undefined;
          const images = item.images as Record<string, unknown> | undefined;
          const reviews = item.customerReviews as Record<string, unknown> | undefined;
          const title = itemInfo?.title as Record<string, unknown> | undefined;
          const primary = images?.primary as Record<string, unknown> | undefined;
          const large = primary?.large as Record<string, unknown> | undefined;
          const starRating = reviews?.starRating as Record<string, unknown> | undefined;

          return {
            title: (title?.displayValue as string) || 'Kein Titel',
            detailUrl: (item.detailPageURL as string) || '#',
            imageUrl: (large?.url as string) || '',
            price: 'Preis nicht verfügbar',
            starRating: parseFloat(String(starRating?.value || '0')),
            reviewCount: (reviews?.count as number) || 0,
          };
        });
      }

      return [];
    } catch (error: unknown) {
      if (error instanceof AmazonAPIError) throw error;

      const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string; name?: string };
      console.error('Error searching Amazon products:', {
        name: err.name,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      throw new AmazonAPIError(
        'Failed to search Amazon products: ' +
          (err.response?.data?.message || err.message),
        err.response?.status === 429 ? 'RATE_LIMIT' : 'API_ERROR'
      );
    }
  }
}

const amazonService = new AmazonService();

export async function searchProducts(keyword: string): Promise<ProductDetails[]> {
  return amazonService.searchProducts(keyword);
}
