import { NextRequest } from 'next/server';
import { Operation } from 'fast-json-patch';
import { executeResearchPipeline } from '@/lib/research/researchEngine';
import { streamSynthesis } from '@/lib/llm/llmRouter';
import { executeSearch } from '@/lib/search/searchEngine';
import { ExecutionStep, SourceItem } from '@/lib/types/thread';

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
                content: { query, mode, model },
              } as ExecutionStep,
            ],
          },
          { op: 'add', path: '/sources', value: [] },
          { op: 'add', path: '/text', value: '' },
        ]);

        // Special dedicated harnesses for Model Council & Learn Step-by-Step
        if (mode === 'model_council' || mode === 'learn') {
          const searchResults = await executeSearch(query, 6);
          emit([
            { op: 'replace', path: '/sources', value: searchResults },
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

          const tokenGenerator = streamSynthesis({
            model,
            query,
            sources: searchResults,
            mode,
          });

          let acc = '';
          for await (const tok of tokenGenerator) {
            acc += tok;
            emit([{ op: 'replace', path: '/text', value: acc }]);
          }

          const duration = Math.round((Date.now() - startTime) / 1000);
          emit([
            { op: 'replace', path: '/steps/1/status', value: 'COMPLETED' },
            { op: 'replace', path: '/status', value: 'COMPLETED' },
            { op: 'add', path: '/timeTakenMs', value: duration },
          ]);
          return;
        }

        // Standard & Deep Research Mode: Run the Multi-Step Research Engine
        const stepIndices = new Map<string, number>();
        stepIndices.set('INITIAL_QUERY', 0);

        await executeResearchPipeline({
          query,
          mode,
          model,
          onStepUpdate: (step: ExecutionStep) => {
            const existingIdx = stepIndices.get(step.stepType);
            if (existingIdx !== undefined) {
              emit([{ op: 'replace', path: `/steps/${existingIdx}`, value: step }]);
            } else {
              const newIdx = stepIndices.size;
              stepIndices.set(step.stepType, newIdx);
              emit([{ op: 'add', path: `/steps/${newIdx}`, value: step }]);
            }
          },
          onSourcesFound: (sources: SourceItem[]) => {
            emit([{ op: 'replace', path: '/sources', value: sources }]);
          },
          onTokenChunk: (text: string) => {
            emit([
              { op: 'replace', path: '/status', value: 'STREAMING' },
              { op: 'replace', path: '/text', value: text },
            ]);
          },
        });

        // Mark completion
        const duration = Math.round((Date.now() - startTime) / 1000);
        emit([
          { op: 'replace', path: '/steps/0/status', value: 'COMPLETED' },
          { op: 'replace', path: '/status', value: 'COMPLETED' },
          { op: 'add', path: '/timeTakenMs', value: duration },
        ]);
      } catch (err: any) {
        console.error('SSE Research Stream error:', err);
        emit([
          { op: 'replace', path: '/status', value: 'FAILED' },
          { op: 'add', path: '/error', value: err.message || 'Research stream error' },
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
