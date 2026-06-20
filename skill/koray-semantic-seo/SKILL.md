---
name: koray-semantic-seo
description: >
  Plan, structure, and audit content the way Koray Tuğberk Gübür's semantic SEO /
  topical authority methodology does — entities and attributes over keywords, topical
  maps over page lists, search-intent coverage over volume. Use this whenever the work
  touches topical maps, topical authority, entity SEO, content briefs or blueprints,
  internal linking strategy, content gap / coverage analysis, cannibalization checks,
  AEO / answer-engine optimization, or any SEO task where the goal is becoming the
  authoritative source for a topic rather than ranking for scattered keywords. Trigger
  this even when the user just says "build a content plan", "map out this topic",
  "write an SEO brief", "plan internal links", or "audit this page" — not only when they
  say "semantic SEO" or "Koray". If the task is about topic structure, entities, or
  search intent, use this skill.
---

# Koray-style Semantic SEO

This skill makes Claude plan, structure, and audit content using the topical authority
and semantic SEO framework popularized by Koray Tuğberk Gübür. It encodes his publicly
taught methodology and the information-retrieval principles it rests on — it is an
interpretation of that framework, not a copy of any private playbook.

The point of the methodology in one line: **don't chase keywords, build the most complete
and trustworthy coverage of a topic so the search engine treats the site as the source.**

## How to think (load this mindset before doing anything)

Adopt these as defaults. They override generic "SEO best practice" instincts.

- **Entities, not keywords.** Every topic is a set of entities, their attributes, and the
  relationships between them. Express facts as clean triples — subject, predicate, object
  (e.g. "Creatine [entity] increases [predicate] muscle strength [object]"). Keywords are
  just surface forms of underlying entities and intents.
- **Topical completeness beats creativity.** The job is to cover the full topic — every
  attribute, every sub-intent, every adjacent entity — before anyone writes a clever
  sentence. Gaps cost more than dull prose.
- **Every page must justify its existence.** A page earns a place only if it owns a
  distinct contextual vector (a unique central entity + attribute + search intent). If two
  pages serve the same intent, one of them is cannibalization, not coverage.
- **Search intent coverage over search volume.** Volume is a vanity input. What matters is
  satisfying the actual question behind the query, in the format the question implies, fast.
- **Structure is a ranking factor in disguise.** Clear hierarchy, answer-first sections,
  and consistent formatting lower the engine's cost of retrieving and trusting your answer.
- **Context flows.** The site has a macro context (what it is allowed to be authoritative
  about) and each page has a micro context. They must agree. Don't write pages the source
  context can't support.
- **Do not write full content unless explicitly told to.** Default to structured planning
  artifacts — entity sets, maps, blueprints, linking graphs, audits. Stage 4 (the writing
  stage) is the only exception, and only when the user asks for it.

For the deeper "why" behind any of these — source context, central entity, central search
intent, contextual hierarchy, momentum, cost of retrieval, query semantics — read
`references/methodology.md`. Read `references/glossary.md` when the user or the task uses
Koray-specific terms and you want everyone speaking the same language.

## The workflow: five stages

This is a pipeline. Each stage takes the previous stage's output as input. A user may ask
for one stage, several, or the whole run. Figure out which stage they're at and run that
one — don't silently skip ahead, and don't run Stage 4 (writing) unless asked.

| Stage | Name | Input | Output |
|---|---|---|---|
| 1 | Entity Extraction | A page title or topic | Entity JSON (entity, attributes, relations, intents) |
| 2 | Content Blueprint | Title + entity data | A 10-section structured outline, no prose |
| 3 | Internal Linking Graph | A topical map | Per-page linking plan with semantic justification |
| 4 | Full Article | A content blueprint | The finished page (only when explicitly requested) |
| 5 | Content Audit | Final content + topical map | Scorecard JSON + required fixes |

There is also **Stage 0: Topical Map** — building the map of pages itself from a seed
topic and source context. It comes before everything when the user is starting fresh.

The exact input contract and output format for every stage lives in
`references/stage-templates.md`. **Read that file before running any stage** so the output
matches the spec precisely (the formats are deliberate — they feed each other).

### Picking the stage

- "Map out this topic" / "what pages should this site have" → **Stage 0** (topical map)
- "What's the entity here" / "break down this topic" → **Stage 1**
- "Give me a brief / outline / blueprint for this page" → **Stage 2**
- "How should these pages link" / "internal linking plan" → **Stage 3**
- "Write the article / page" → **Stage 4** (confirm scope first if the blueprint is missing)
- "Review / score / audit this page" → **Stage 5**

When the request is ambiguous, make the most logical assumption from context and proceed,
then state the assumption in one line. Don't stall the team with clarifying questions they
could answer faster by seeing a draft.

## Operating rules (apply to every stage)

These come straight from the methodology and keep the output disciplined:

1. **No duplication across pages or sections.** Before adding any node or section, check it
   doesn't repeat one that exists. Each must serve a distinct intent.
2. **Justify everything.** Every page, every section, every link gets a one-line reason
   tied to topical authority. If you can't justify it, cut it.
3. **Think hierarchically.** Always place a topic in its parent / child / sibling structure.
   Nothing floats unattached.
4. **Order by logic, not habit.** Sequence sections and pages so context builds correctly:
   definition before comparison, core section before outer section, broad before narrow.
5. **Answer-first.** Wherever a section maps to a question, the opening sentence should
   answer it directly. Bury nothing.
6. **Output in the specified structure only.** JSON where the template says JSON, clean
   outline where it says outline. No filler intros, no "in today's digital landscape".
7. **Fill the gaps competitors ignore.** Actively surface edge cases, misconceptions, and
   under-covered attributes — that unique information is what earns authority.

## Honesty and limits

- Flag when a requested page or claim isn't supported by the site's source context — that's
  a topical authority risk, not a detail to paper over.
- If you're unsure whether two pages overlap, say so and show the contextual vectors side by
  side rather than guessing.
- This skill is methodology, not a live ranking guarantee. Search behavior changes; treat
  the framework as a way to reason, and verify anything time-sensitive against current data.

## Quick reference: when each file matters

- `references/methodology.md` — the concepts and the reasoning behind them. Read when you
  need to explain *why*, or when a stage decision hinges on source context / central entity
  / contextual flow / momentum.
- `references/stage-templates.md` — the exact input + output contract for Stage 0 through
  Stage 5. Read before running any stage.
- `references/glossary.md` — Koray terminology decoded. Read when terms appear and you want
  to keep the team aligned.
