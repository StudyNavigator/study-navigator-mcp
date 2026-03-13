# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start local development server (wrangler dev)
npm run deploy       # Deploy to Cloudflare Workers
npm run type-check   # TypeScript type checking (tsc --noEmit)
npm run lint:fix     # Fix linting issues with oxlint
npm run format       # Format code with oxfmt
npm run cf-typegen   # Regenerate worker-configuration.d.ts from wrangler.jsonc
```

There are no tests in this project.

## Architecture

This is a **remote MCP (Model Context Protocol) server** running on Cloudflare Workers. It exposes AI tools via HTTP at the `/mcp` endpoint for use with MCP-compatible clients (Claude Desktop, Cloudflare AI Playground, etc.).

**Key files:**

- `src/index.ts` — The entire application. Defines `MyMCP` extending `McpAgent` from the `agents` package, registers tools via `this.server.tool(...)`, and exports a `fetch` handler routing `/mcp` to the agent.
- `wrangler.jsonc` — Cloudflare Workers config. The `MyMCP` class is bound as a Durable Object (`MY_MCP`), which is how MCP session state is persisted across requests.
- `worker-configuration.d.ts` — Auto-generated types; do not edit manually, run `npm run cf-typegen` to regenerate.

**How tools are added:** In `src/index.ts`, inside `MyMCP.init()`, call `this.server.tool(name, description, zodSchema, handler)`. The `zod` library defines input schemas, and handlers return `{ content: [{ type: "text", text: "..." }] }`.

## Code Style

- Formatter: `oxfmt` — tabs, width 100
- Linter: `oxlint` — TypeScript plugin enabled; `any` types and non-null assertions are allowed
- TypeScript strict mode is on
