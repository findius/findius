export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class AmazonAPIError extends APIError {
  constructor(message: string, code?: string) {
    super(message, 503, code);
    this.name = 'AmazonAPIError';
  }
}

export class OpenAIError extends APIError {
  constructor(message: string, code?: string) {
    super(message, 503, code);
    this.name = 'OpenAIError';
  }
}

export function trackError(error: Error, context: Record<string, unknown> = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
  };
  console.error('Error occurred:', JSON.stringify(errorLog, null, 2));
  return getUserFriendlyMessage(error);
}

function getUserFriendlyMessage(error: Error): string {
  if (error instanceof AmazonAPIError) {
    return 'Wir haben gerade Probleme beim Zugriff auf Produktinformationen. Bitte versuche es gleich nochmal.';
  }
  if (error instanceof OpenAIError) {
    return 'Wir haben gerade Schwierigkeiten, deine Anfrage zu verarbeiten. Bitte versuche es gleich nochmal.';
  }
  return 'Etwas ist schiefgelaufen. Bitte versuche es erneut.';
}
