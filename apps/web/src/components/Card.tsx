import type { Config } from '@ps154/shared';
import type { Card } from '../batch/state';

const LABEL: Record<Card['status'], string> = {
  waiting: 'Waiting…', running: 'Generating…', validating: 'Checking facts…',
  ready: 'Ready', error: 'Failed',
};

/** Placeholder — Step 6 replaces this with the real card (claims, provenance, badges). */
export function CardView({ card, onRegenerate }: {
  card: Card; globalConfig: Config; onRegenerate: () => void;
}) {
  return (
    <div className="rounded border bg-white p-4">
      <div className="flex items-center justify-between">
        <b>{card.format_id}</b>
        <span className="text-sm text-slate-500">{LABEL[card.status]}</span>
      </div>
      {card.detail && <p className="text-xs text-slate-500">{card.detail}</p>}
      {card.status === 'ready' && <p className="mt-2 whitespace-pre-wrap text-sm">{card.artifact?.content}</p>}
      {card.status === 'error' && (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-red-700">{card.error?.message}</p>
          {card.error?.retryable && (
            <button onClick={onRegenerate} className="rounded border px-3 py-1 text-sm">Retry</button>
          )}
        </div>
      )}
    </div>
  );
}
