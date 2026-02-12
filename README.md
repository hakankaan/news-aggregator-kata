# News Aggregator

A React news aggregator that fetches articles from multiple sources (NewsAPI, GNews, NYTimes).

## Quick Start

```bash
npm install
cp .env.example .env  # Add your API keys
npm run dev
```

## Docker

```bash
cp .env.example .env  # Add your API keys
make build            # Build production image
make run              # Run on http://localhost:3000
make stop             # Stop container
```

## Note

API keys are kept on the frontend for simplicity in this take-home task. In production, these should be proxied through a backend to avoid exposure.


## Testing

Vitest + React Testing Library + MSW for API mocking.

```bash
npm test
```

## Tech Stack

React 19 | TypeScript | Vite | TanStack Query | Tailwind CSS | Vitest | MSW


