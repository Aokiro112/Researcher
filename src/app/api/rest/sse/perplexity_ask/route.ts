import { NextRequest } from 'next/server';
import { Operation } from 'fast-json-patch';
import { executeSearch } from '@/lib/search/searchEngine';
import { scrapeUrl } from '@/lib/search/scraper';
import { runDeepResearchPlanning } from '@/lib/search/deepResearch';
import { streamSynthesis } from '@/lib/llm/llmRouter';
import { SourceItem, ExecutionStep } from '@/lib/types/thread';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const query = body.rawQuery || body.query || 'What is quantum computing?';
  const mode = body.queryMode || body.mode || 'search';
  const model = body.modelPreferenceSubmit || body.model || 'gemini-3.8-flash';
  const startTime = Date.now();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (patches: Operation[]) => {
        controller.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify(patches)}\n\n`));
      };

      try {
        // 1. Initial State
        emit([
          { op: 'add', path: '/status', value: 'SEARCHING' },
          {
            op: 'add',
            path: '/steps',
            value: [
              {
                stepType: 'INITIAL_QUERY',
                status: 'RUNNING',
                content: { query, mode },
              } as ExecutionStep,
            ],
          },
          { op: 'add', path: '/sources', value: [] },
          { op: 'add', path: '/text', value: '' },
        ]);

        let finalSources: SourceItem[] = [];

        // 2. Execution depending on mode
        if (mode === 'deep_research') {
          // Deep Research Planner
          const deepPlan = await runDeepResearchPlanning(query, (step) => {
            emit([
              { op: 'replace', path: '/steps/0/status', value: 'COMPLETED' },
              { op: 'add', path: '/steps/1', value: step },
            ]);
          });
          finalSources = deepPlan.allSources;

          emit([
            { op: 'replace', path: '/sources', value: finalSources },
            {
              op: 'add',
              path: '/steps/2',
              value: {
                stepType: 'SYNTHESIS',
                status: 'RUNNING',
              } as ExecutionStep,
            },
            { op: 'replace', path: '/status', value: 'STREAMING' },
          ]);
        } else {
          // Standard Search Execution
          const searchResults = await executeSearch(query, 6);

          finalSources = [...searchResults];
          if (searchResults.length > 0) {
            try {
              const pageData = await scrapeUrl(searchResults[0].url, 3000);
              if (pageData && pageData.text) {
                finalSources[0].snippet = pageData.text.slice(0, 400);
              }
            } catch {}
          }

          emit([
            { op: 'replace', path: '/sources', value: finalSources },
            { op: 'replace', path: '/steps/0/status', value: 'COMPLETED' },
            {
              op: 'add',
              path: '/steps/1',
              value: {
                stepType: 'SYNTHESIS',
                status: 'RUNNING',
              } as ExecutionStep,
            },
            { op: 'replace', path: '/status', value: 'STREAMING' },
          ]);
        }

        // 3. LLM Streaming Synthesis
        const tokenGenerator = streamSynthesis({
          model,
          query,
          sources: finalSources,
          mode,
        });

        let accumulatedText = '';
        for await (const token of tokenGenerator) {
          accumulatedText += token;
          emit([{ op: 'replace', path: '/text', value: accumulatedText }]);
        }

        // 4. Mark Completed
        const duration = Math.round((Date.now() - startTime) / 1000);
        emit([
          { op: 'replace', path: `/steps/${mode === 'deep_research' ? 2 : 1}/status`, value: 'COMPLETED' },
          { op: 'replace', path: '/status', value: 'COMPLETED' },
          { op: 'add', path: '/timeTakenMs', value: duration },
        ]);
      } catch (err: any) {
        console.error('SSE Stream execution error:', err);
        emit([
          { op: 'replace', path: '/status', value: 'FAILED' },
          { op: 'add', path: '/error', value: err.message || 'Stream processing error' },
        ]);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
