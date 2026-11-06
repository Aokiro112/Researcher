import { applyPatch, Operation } from 'fast-json-patch';
import { ThreadEntry } from '../types/thread';

export interface StreamCallbacks {
  onUpdate: (state: Partial<ThreadEntry>) => void;
  onComplete: (finalState: ThreadEntry) => void;
  onError: (error: Error) => void;
}

export function startSearchStream(
  query: string,
  mode: string,
  model: string,
  callbacks: StreamCallbacks
): { abort: () => void } {
  const controller = new AbortController();

  let state: Record<string, any> = {
    queryText: query,
    status: 'PENDING',
    responseText: '',
    sources: [],
    steps: [],
    modelUsed: model,
  };

  (async () => {
    try {
      const response = await fetch('/api/rest/sse/perplexity_ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          rawQuery: query,
          queryMode: mode,
          modelPreferenceSubmit: model,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Stream request failed with status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawJson = line.slice(6).trim();
            if (rawJson) {
              try {
                const patches: Operation[] = JSON.parse(rawJson);
                // Apply RFC 6902 patches immutably to state
                const patchResult = applyPatch(state, patches, true, false);
                state = patchResult.newDocument;

                callbacks.onUpdate({
                  status: state.status,
                  responseText: state.text || '',
                  sources: state.sources || [],
                  steps: state.steps || [],
                  timeTakenMs: state.timeTakenMs,
                });
              } catch (e) {
                console.error('Failed to parse or apply stream patch:', e, rawJson);
              }
            }
          }
        }
      }

      callbacks.onComplete(state as ThreadEntry);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        callbacks.onError(err);
      }
    }
  })();

  return {
    abort: () => controller.abort(),
  };
}
