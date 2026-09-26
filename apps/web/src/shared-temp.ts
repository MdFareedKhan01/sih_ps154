// TEMP — remove this file once B/D add SourceRecord and BatchCreated to
// @ps154/shared (they own these: B defines the API/batch shapes, D the
// canonical object). Once added there, delete this file and change the
// import in Ingest.tsx / Confirm.tsx back to '@ps154/shared'.

import type { Canonical, Span } from '@ps154/shared';

export type SourceRecord = {
  id: string;
  raw_content: string;
  spans: Span[];
  canonical?: Canonical;
};

export type BatchCreated = {
  batch_id: string;
};