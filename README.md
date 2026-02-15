# findius-next

Smart product comparison platform powered by AI. Search Amazon products with natural language and get AI-generated evaluations.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** components
- **Framer Motion** animations
- **OpenAI** GPT-4o-mini for product analysis
- **Amazon Creators API** for product search

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your API keys in .env.local
```

### Environment Variables

| Variable | Description |
|---|---|
| `AMAZON_ACCESS_KEY` | Amazon Creators API credential ID |
| `AMAZON_SECRET_KEY` | Amazon Creators API credential secret |
| `AMAZON_PARTNER_TAG` | Amazon Associates partner tag |
| `OPENAI_API_KEY` | OpenAI API key |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Inter font, metadata
│   ├── page.tsx            # Homepage with search interface
│   ├── globals.css         # Tailwind + custom styles + dark mode
│   └── api/
│       ├── chat/route.ts           # Main chat/search endpoint
│       └── evaluate-batch/route.ts # Batch product evaluation
├── components/
│   ├── SearchBar.tsx       # Search input with suggestions
│   ├── ProductCard.tsx     # Individual product display card
│   ├── ProductGrid.tsx     # Product results grid layout
│   ├── ChatInterface.tsx   # Main search + results orchestrator
│   ├── ThemeProvider.tsx   # Dark/light mode context
│   ├── ThemeToggle.tsx     # Theme switch button
│   └── ui/                 # shadcn/ui components
└── lib/
    ├── amazon.ts           # Amazon Creators API service
    ├── openai.ts           # OpenAI chat + evaluation service
    ├── cache.ts            # In-memory response cache (5min TTL)
    ├── errors.ts           # Custom error classes
    └── utils.ts            # Tailwind merge utility
```

## API Endpoints

### POST /api/chat

Analyzes user query with AI, searches Amazon, returns products + intro message.

```json
{
  "message": "Kopfhörer zum Joggen",
  "history": [],
  "marketplace": { "domain": "www.amazon.de", "language": "de_DE" }
}
```

### POST /api/evaluate-batch

Batch evaluates products with AI-generated assessments.

```json
{
  "message": "original search query",
  "products": [],
  "marketplace": { "domain": "www.amazon.de", "language": "de_DE" }
}
```
