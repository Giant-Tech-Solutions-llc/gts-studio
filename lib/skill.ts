import 'server-only';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Loads the bundled koray-semantic-seo skill and assembles the system prompt.
// Base prompt = SKILL.md + references/*.md. Per request we append the active
// stage's contract, extracted from stage-templates.md, to focus the model.

const SKILL_ROOT = join(process.cwd(), 'skill', 'koray-semantic-seo');

function read(rel: string): string {
  return readFileSync(join(SKILL_ROOT, rel), 'utf8');
}

// Read once at module load; the files are immutable at runtime.
const SKILL_MD = read('SKILL.md');
const METHODOLOGY_MD = read('references/methodology.md');
const GLOSSARY_MD = read('references/glossary.md');
const STAGE_TEMPLATES_MD = read('references/stage-templates.md');

const BASE_PROMPT = [
  SKILL_MD,
  '\n\n---\n\n',
  METHODOLOGY_MD,
  '\n\n---\n\n',
  GLOSSARY_MD,
].join('');

/**
 * Extract a single stage's section from stage-templates.md.
 * Sections are delimited by "## Stage N — ..." headings.
 * Stage 0 also covers the "Topical Map" header variant.
 */
function extractStageContract(stageId: number): string {
  const lines = STAGE_TEMPLATES_MD.split('\n');
  const headingRe = /^##\s+Stage\s+(\d+)\b/;
  let start = -1;
  let end = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(headingRe);
    if (m) {
      const n = Number(m[1]);
      if (n === stageId && start === -1) {
        start = i;
      } else if (start !== -1 && n !== stageId) {
        end = i;
        break;
      }
    }
  }

  if (start === -1) return '';
  // Trim a trailing horizontal-rule separator that belongs to the next section.
  let slice = lines.slice(start, end);
  while (slice.length && (slice[slice.length - 1].trim() === '' || slice[slice.length - 1].trim() === '---')) {
    slice.pop();
  }
  return slice.join('\n').trim();
}

const OUTPUT_DIRECTIVE: Record<'json' | 'outline' | 'markdown', string> = {
  json:
    'OUTPUT FORMAT: Respond with a single valid JSON document that matches the contract above. ' +
    'No prose before or after, no markdown code fences — emit raw JSON only.',
  outline:
    'OUTPUT FORMAT: Respond with the clean outline exactly as specified — no prose paragraphs, ' +
    'no JSON. Keep the numbered section structure and the per-section intent notes.',
  markdown:
    'OUTPUT FORMAT: Respond with the finished article as clean Markdown (headings, lists, tables ' +
    'where a comparison calls for it). Answer-first in every section. No meta commentary about the task.',
};

export function buildSystemPrompt(
  stageId: number,
  renderer: 'json' | 'outline' | 'markdown'
): string {
  const contract = extractStageContract(stageId);
  return [
    BASE_PROMPT,
    '\n\n---\n\n# ACTIVE STAGE CONTRACT (run this stage only)\n\n',
    contract,
    '\n\n',
    OUTPUT_DIRECTIVE[renderer],
  ].join('');
}
