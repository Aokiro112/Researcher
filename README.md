# Researcher

A functionally equivalent, high-performance open-source reproduction of **Perplexity AI** (`https://www.perplexity.ai/`). Built with Next.js 15 (App Router), React 19, TypeScript, and Tailwind CSS.

OpenPPLX delivers Perplexity's core conversational search experience, including the reverse-engineered **RFC 6902 JSON Patch streaming protocol**, multi-hop Deep Research, Model Council deliberation, and interactive citation grounding—functioning completely out of the box with zero mandatory paid API keys.

---

## 🚀 Key Architectural Features

### 1. Reverse-Engineered Streaming Protocol
Perplexity does not stream plain text deltas; it streams atomic **RFC 6902 JSON Patches** over Server-Sent Events (`/api/rest/sse/perplexity_ask`). OpenPPLX implements this exact protocol using `fast-json-patch`:
- Mutates the thread state tree (`/status`, `/steps`, `/sources`, `/text`, `/timeTakenMs`) without triggering expensive full-component re-renders.
- Supports granular execution steps (`INITIAL_QUERY` → `MULTI_QUERY` → `WEB_SEARCH` → `SYNTHESIS` → `COMPLETED`).
- Built-in reconnection and abort handling.

### 2. Multi-Mode Search Harnesses
- 🔍 **Search (Default)**: Rapid single-hop web retrieval and grounded answer synthesis.
- 🔬 **Deep Research**: Multi-hop planning that decomposes queries into orthogonal sub-queries, executes parallel searches, scrapes top web pages, and cross-references citations.
- 🏛️ **Model Council**: Concurrent multi-model deliberation (Claude Sonnet 5.5, Gemini 3.8 Flash, DeepSeek R1) with comparative trade-off matrix and unified consensus verdict.
- 🎓 **Learn Step-by-Step**: Pedagogical breakdown from core mental models to step-by-step mechanics and interactive comprehension quiz checks.
- 💻 **Computer & Tasks**: Task delegation hub for automated browsing and research agents.

### 3. Resilient Multi-Provider Retrieval & Synthesis
- **Zero-Config Fallback**: Works immediately out of the box using built-in Cheerio-based DuckDuckGo HTML scraping and an offline grounded synthesis engine.
- **Search Providers**: Plug in SearXNG, Tavily, Brave Search, or Serper via environment variables.
- **LLM Providers**: Connect Ollama (local DeepSeek R1 / Llama 3.3), OpenAI (`gpt-4o`), Anthropic (`claude-3-5-sonnet`), or Gemini.

### 4. Aether-Inspired Responsive UI
- **Resizable Collapsible Sidebar**: Draggable width (200px–420px), accordions for Teammates, Projects, and Recents, with `Ctrl+I` keyboard toggle.
- **Query Composer**: Auto-expanding textarea, mode switcher pills, typeahead autosuggest overlay, file attachment menu, and voice dictation stub.
- **Sources Drawer**: Expandable source cards with domain favicons, trust badges, and ordinal tags (`[1]`, `[2]`).
- **Answer View**: Markdown formatting, responsive citation popovers, copy/share/re-query action bars, and latency counters.
- **Contextual Auth & Pricing Modals**: Free ($0), Pro ($17/mo), and Max ($167/mo) tier breakdowns and soft-gated workflows.

---

## 🛠️ Architecture & Tech Stack

```
Perplexity/
├── src/
│   ├── app/
│   │   ├── api/rest/
│   │   │   ├── autosuggest/list-autosuggest/  # Typeahead autosuggest API
│   │   │   ├── models/config/                 # Dynamic model catalog
│   │   │   └── sse/perplexity_ask/            # RFC 6902 JSON Patch SSE stream
│   │   ├── search/[uuid]/                     # Conversational thread view
│   │   ├── computer/tasks/                    # Computer agent tasks hub
│   │   ├── computer/plugins/                  # MCP & native plugins catalog
│   │   ├── automations/                       # Scheduled background workflows
│   │   ├── library/                           # Saved collections & threads
│   │   ├── projects/                          # Collaborative workspaces
│   │   ├── artifacts/                         # Generated documents & code
│   │   ├── teammates/                         # Team sharing & permissions
│   │   ├── layout.tsx                         # Global responsive app shell
│   │   └── page.tsx                           # Homepage with hero & composer
│   ├── components/
│   │   ├── sidebar/AppSidebar.tsx             # Resizable sidebar & accordions
│   │   ├── composer/QueryComposer.tsx         # Auto-resizing query composer
│   │   ├── composer/ModelPicker.tsx           # Model selector with tier badges
│   │   ├── composer/AttachmentMenu.tsx        # File & MCP connector menu
│   │   ├── search/ThinkingIndicator.tsx       # Live status progress pulse
│   │   ├── search/SourcesDrawer.tsx           # Expandable sources grid
│   │   ├── search/AnswerView.tsx              # Markdown & citation pills
│   │   └── modals/                            # Auth & Pricing dialogs
│   └── lib/
│       ├── llm/
│       │   ├── llmRouter.ts                   # Multi-provider streaming router
│       │   └── modelCouncil.ts                # Model Council deliberation
│       ├── search/
│       │   ├── searchEngine.ts                # Multi-provider search engine
│       │   ├── scraper.ts                     # Cheerio web scraper
│       │   └── deepResearch.ts                # Multi-hop sub-query planner
│       ├── stream/streamClient.ts             # Client-side SSE patch applicator
│       ├── store.ts                           # LocalStorage state management
│       └── types/thread.ts                    # Thread, Entry, Step, Source types
├── docker-compose.yml                         # Containerized SearXNG & DB stack
└── .env.example                               # Environment configuration
```

---

## ⚡ Quickstart

### Prerequisites
- Node.js 18+ (tested on Node 22 and Node 26)
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/your-username/open-pplx.git
cd open-pplx
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local` if you wish to configure external providers:
```bash
cp .env.example .env.local
```
> **Note**: Even with an empty `.env.local`, OpenPPLX will run fully functional searches using the built-in scraper and synthesis engine!

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Verification & Probes

You can test the backend streaming API directly via curl:

```bash
# Standard Search Stream
curl -N -s -X POST http://localhost:3000/api/rest/sse/perplexity_ask \
  -H "Content-Type: application/json" \
  -d '{"query":"What is the James Webb Space Telescope?","mode":"search"}'

# Model Council Stream
curl -N -s -X POST http://localhost:3000/api/rest/sse/perplexity_ask \
  -H "Content-Type: application/json" \
  -d '{"query":"Should teams adopt microservices in 2026?","mode":"model_council"}'

# Deep Research Multi-Hop Stream
curl -N -s -X POST http://localhost:3000/api/rest/sse/perplexity_ask \
  -H "Content-Type: application/json" \
  -d '{"query":"CRISPR advances in 2026","mode":"deep_research"}'
```

---

## 📜 Reverse-Engineering Artifacts

Complete investigation documents and decompiled evidence ledgers are preserved in the conversation artifacts:
- **Capability Specification**: [perplexity_reverse_engineering_specification.md](file:///home/aokiro/.gemini/antigravity/brain/170e6611-5db3-441d-9556-61e27fa21366/perplexity_reverse_engineering_specification.md)
- **Implementation Plan**: [implementation_plan.md](file:///home/aokiro/.gemini/antigravity/brain/170e6611-5db3-441d-9556-61e27fa21366/implementation_plan.md)
