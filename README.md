# Multi-Agent Code Review & Debugging Network

Automated tri-agent system (Code Reviewer, Bug Finder, Refactor Advisor) that analyzes public GitHub repositories and produces actionable feedback.

## Quick Start

Requirements: Node 18+

```bash
npm install
npm run build
npm start
```

Open http://localhost:3000 and analyze a repo URL like:

- https://github.com/vercel/next.js
- https://github.com/facebook/react

Optional environment variables:

- `GITHUB_TOKEN`: increases GitHub API rate limits for repo fetching.

## Deploy (Vercel)

Authenticated Vercel CLI required in CI or with `VERCEL_TOKEN` env var.

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-d1392485
```

## Architecture

- `app/api/analyze/route.ts`: Serverless API to fetch repo and run agents
- `lib/github.ts`: GitHub URL parsing and file fetching
- `lib/agents/*`: Three rule-based agents
- `components/*`: UI for input and results rendering

## Notes

- The analysis is deterministic and rule-based for reliability; it can be extended with LLM backends.
- The API limits file sizes and counts to keep latency reasonable on serverless platforms.
