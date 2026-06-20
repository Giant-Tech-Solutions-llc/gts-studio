// Stage definitions — shared by client (forms/renderers) and server (prompts).
// Six modes, one selector. Each stage owns an input schema and an output renderer.

export type ModelId = 'claude-sonnet-4-6' | 'claude-opus-4-8';

export const MODELS: Record<ModelId, { label: string; note: string }> = {
  'claude-sonnet-4-6': { label: 'Sonnet 4.6', note: 'Fast default' },
  'claude-opus-4-8': { label: 'Opus 4.8', note: 'Deeper reasoning' },
};

export const DEFAULT_MODEL: ModelId = 'claude-sonnet-4-6';

export type RendererKind = 'json' | 'outline' | 'markdown';

export type FieldKind = 'text' | 'textarea';

export interface StageField {
  name: string;
  label: string;
  kind: FieldKind;
  placeholder: string;
  required: boolean;
  /** Marks the field that carries piped output from a previous stage. */
  pipeTarget?: boolean;
  help?: string;
}

export interface Stage {
  id: number;
  key: string;
  name: string;
  tagline: string;
  /** Stage that produces this stage's main input, for "send to next stage". */
  feedsInto: number | null;
  renderer: RendererKind;
  /** Opus toggle only offered where the spec allows it (Stage 0 and Stage 4). */
  allowOpus: boolean;
  /** Stage 4 must confirm before running. */
  requireConfirm: boolean;
  fields: StageField[];
}

export const STAGES: Stage[] = [
  {
    id: 0,
    key: 'topical-map',
    name: 'Topical Map',
    tagline: 'Build the map of pages from a seed topic + source context.',
    feedsInto: 3,
    renderer: 'json',
    allowOpus: true,
    requireConfirm: false,
    fields: [
      {
        name: 'seed_topic',
        label: 'Seed topic',
        kind: 'text',
        placeholder: 'e.g. creatine supplementation',
        required: true,
      },
      {
        name: 'source_context',
        label: 'Source context',
        kind: 'textarea',
        placeholder:
          'What the site is, who it serves, what it sells / its purpose. e.g. "A sports-nutrition brand selling creatine and protein to strength athletes."',
        required: true,
        help: 'The map depends on this. If omitted, the model infers and states its assumption.',
      },
    ],
  },
  {
    id: 1,
    key: 'entity-extraction',
    name: 'Entity Extraction',
    tagline: 'Break a topic into entity, attributes, relations, and intents.',
    feedsInto: 2,
    renderer: 'json',
    allowOpus: false,
    requireConfirm: false,
    fields: [
      {
        name: 'title',
        label: 'Page title or topic',
        kind: 'text',
        placeholder: 'e.g. Creatine Monohydrate: Benefits and Dosage',
        required: true,
      },
    ],
  },
  {
    id: 2,
    key: 'content-blueprint',
    name: 'Content Blueprint',
    tagline: 'A structured 10-section outline — no prose.',
    feedsInto: 4,
    renderer: 'outline',
    allowOpus: false,
    requireConfirm: false,
    fields: [
      {
        name: 'title',
        label: 'Page title',
        kind: 'text',
        placeholder: 'e.g. Creatine Monohydrate: Benefits and Dosage',
        required: true,
      },
      {
        name: 'entity_data',
        label: 'Entity data (Stage 1 output)',
        kind: 'textarea',
        placeholder: 'Paste the entity JSON from Stage 1 here.',
        required: true,
        pipeTarget: true,
      },
    ],
  },
  {
    id: 3,
    key: 'internal-linking',
    name: 'Internal Linking Graph',
    tagline: 'Per-page linking plan with semantic justification.',
    feedsInto: null,
    renderer: 'json',
    allowOpus: false,
    requireConfirm: false,
    fields: [
      {
        name: 'topical_map',
        label: 'Topical map (Stage 0 output, or an existing map)',
        kind: 'textarea',
        placeholder: 'Paste the topical map JSON or a list of pages.',
        required: true,
        pipeTarget: true,
      },
    ],
  },
  {
    id: 4,
    key: 'full-article',
    name: 'Full Article',
    tagline: 'The finished page, written strictly from the blueprint.',
    feedsInto: 5,
    renderer: 'markdown',
    allowOpus: true,
    requireConfirm: true,
    fields: [
      {
        name: 'blueprint',
        label: 'Content blueprint (Stage 2 output)',
        kind: 'textarea',
        placeholder: 'Paste the blueprint outline from Stage 2 here.',
        required: true,
        pipeTarget: true,
      },
    ],
  },
  {
    id: 5,
    key: 'content-audit',
    name: 'Content Audit',
    tagline: 'Scorecard + specific, actionable required fixes.',
    feedsInto: null,
    renderer: 'json',
    allowOpus: false,
    requireConfirm: false,
    fields: [
      {
        name: 'content',
        label: 'Final content',
        kind: 'textarea',
        placeholder: 'Paste the finished page content to audit.',
        required: true,
        pipeTarget: true,
      },
      {
        name: 'topical_map',
        label: 'Topical map',
        kind: 'textarea',
        placeholder: 'Paste the topical map so duplication can be checked.',
        required: false,
      },
    ],
  },
];

export const MIN_STAGE = 0;
export const MAX_STAGE = 5;
export const INPUT_CHAR_CAP = 8000;

export function getStage(id: number): Stage | undefined {
  return STAGES.find((s) => s.id === id);
}

export function isValidMode(id: unknown): id is number {
  return (
    typeof id === 'number' &&
    Number.isInteger(id) &&
    id >= MIN_STAGE &&
    id <= MAX_STAGE
  );
}

/**
 * Compose the form fields into a single labelled input string for the API.
 * Keeps the API contract simple: { mode, input, model }.
 */
export function composeInput(
  stage: Stage,
  values: Record<string, string>
): string {
  return stage.fields
    .map((f) => {
      const v = (values[f.name] ?? '').trim();
      if (!v) return null;
      return `## ${f.label}\n${v}`;
    })
    .filter(Boolean)
    .join('\n\n');
}
