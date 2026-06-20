import { INPUT_CHAR_CAP, isValidMode, MODELS, type ModelId } from './stages';

export interface RunRequest {
  mode: number;
  input: string;
  model: ModelId;
}

export type ValidationResult =
  | { ok: true; value: RunRequest }
  | { ok: false; error: string };

// Strip control chars (keep \t \n \r) that can corrupt prompts or logs.
// Built from escapes so no literal control bytes live in source.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = new RegExp('[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]', 'g');

export function sanitizeInput(raw: string): string {
  return raw.replace(CONTROL_CHARS, '').trim();
}

export function validateRunRequest(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }
  const { mode, input, model } = body as Record<string, unknown>;

  if (!isValidMode(mode)) {
    return { ok: false, error: 'Invalid mode. Pick a stage between 0 and 5.' };
  }

  if (typeof input !== 'string') {
    return { ok: false, error: 'Input must be a string.' };
  }
  const cleaned = sanitizeInput(input);
  if (cleaned.length === 0) {
    return { ok: false, error: 'Input is empty. Fill in the form before running.' };
  }
  if (cleaned.length > INPUT_CHAR_CAP) {
    return {
      ok: false,
      error: `Input is too long (${cleaned.length} chars). Limit is ${INPUT_CHAR_CAP}.`,
    };
  }

  const requestedModel = (typeof model === 'string' ? model : '') as ModelId;
  const safeModel: ModelId = requestedModel in MODELS ? requestedModel : 'claude-sonnet-4-6';

  return { ok: true, value: { mode, input: cleaned, model: safeModel } };
}
