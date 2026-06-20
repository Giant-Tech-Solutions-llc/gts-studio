# Stage templates: input + output contracts

Read this before running any stage. The formats are deliberate — each stage's output is the
next stage's input, so matching the contract keeps the pipeline coherent. Run only the stage
the user is asking for. Never run Stage 4 (writing) unless explicitly requested.

Apply the operating rules from SKILL.md to every stage: no duplication, justify everything,
think hierarchically, order by logic, answer-first, structured output only, hunt for the
gaps competitors ignore.

---

## Stage 0 — Topical Map (build the map of pages)

Run this when the user is starting fresh and needs the structure of pages itself.

**Input:** a seed topic + the source context (what the site is, who it serves, what it
sells / its purpose). If source context is missing, ask for it in one line or infer the most
logical one and state the assumption — the map depends on it.

**Process:**
1. Fix the central entity and central search intent from the source context.
2. Split pages into core section (closest to the entity and to conversion) and outer section
   (supporting / adjacent entities that build authority).
3. Give every page a distinct contextual vector (central entity + attribute + intent).
4. Place every page in a parent / child / sibling hierarchy.

**Output:**
```json
{
  "source_context": "",
  "central_entity": "",
  "central_search_intent": "",
  "core_section": [
    {
      "page_title": "",
      "contextual_vector": "entity + attribute + intent",
      "intent": "informational | commercial | transactional | navigational",
      "parent": "",
      "justification": "one line tied to topical authority"
    }
  ],
  "outer_section": [
    {
      "page_title": "",
      "contextual_vector": "",
      "intent": "",
      "parent": "",
      "justification": ""
    }
  ]
}
```

---

## Stage 1 — Entity Extraction

**Input:** a page title or topic.

**Process:** define the primary entity, then extract its attributes, related entities, and
alternatives; define problems solved, use cases, and misconceptions; generate real user
questions and the edge cases most content ignores.

**Output:**
```json
{
  "entity": "",
  "attributes": [],
  "related_entities": [],
  "alternatives": [],
  "use_cases": [],
  "problems_solved": [],
  "misconceptions": [],
  "questions": [],
  "edge_cases": []
}
```

---

## Stage 2 — Content Blueprint

**Input:** page title + entity data (Stage 1 output).

**Process:** produce a structured outline only — no prose. Each section serves one distinct
intent and must not overlap another. State the primary and secondary intents up front.

**Output (clean outline, in this order):**
```
Page Title:
Primary Intent:
Secondary Intents:

1. Definition — clear, direct [intent: ___]
2. Context & Importance [intent: ___]
3. Deep Explanation [intent: ___]
4. Attributes Breakdown [intent: ___]
5. Use Cases [intent: ___]
6. Comparisons (vs alternatives) [intent: ___]
7. Pros and Cons [intent: ___]
8. Common Mistakes [intent: ___]
9. Edge Cases [intent: ___]
10. FAQs (real user questions) [intent: ___]
```
For each section, note in one line what distinct intent it serves and the key entities /
attributes it must cover. Drop or merge any section that would duplicate another for this
specific page (the 10 are a default spine, not a quota).

---

## Stage 3 — Internal Linking Graph

**Input:** the topical map (Stage 0 output, or an existing map).

**Process:** for each page, define parent / child / sibling pages, then build the links.
Every link must strengthen topical authority and carry context along the contextual flow.
No random links, no overlinking.

**Output (structured graph per page):**
```json
{
  "page": "",
  "parent": "",
  "children": [],
  "siblings": [],
  "links_out": [
    {
      "to": "",
      "semantic_relationship": "why this link exists",
      "type": "navigational | contextual | comparative"
    }
  ],
  "links_in": [
    {
      "from": "",
      "semantic_relationship": "",
      "type": "navigational | contextual | comparative"
    }
  ]
}
```

---

## Stage 4 — Full Article (only when explicitly requested)

**Input:** a content blueprint (Stage 2 output).

**Rules:**
- Follow the blueprint strictly; cover every entity and relationship it names.
- Clear, simple language, no fluff. Completeness over style.
- Include real examples and comparisons where relevant.
- Layer it: clear enough for beginners, deep enough for advanced readers.
- Answer-first in every section — the opening sentence answers the section's question.
- Avoid generic intros, repetition, and surface-level explanations.

**Goal:** the page should read like the only resource a person needs on the topic. If the
blueprint is missing, build or confirm it (Stage 2) before writing rather than improvising
structure.

---

## Stage 5 — Content Audit

**Input:** final content + the topical map.

**Process — evaluate against five axes:**
1. Coverage — are all relevant entities and attributes included? Any missing angles?
2. Intent match — does it fully satisfy the target intent?
3. Duplication — does it overlap another page's contextual vector?
4. Depth — surface-level or complete?
5. Internal linking — are links logically placed and carrying context?

**Output:**
```json
{
  "coverage_score": "/10",
  "intent_match_score": "/10",
  "duplication_risk": "low | medium | high",
  "depth_score": "/10",
  "fixes_required": []
}
```
Make `fixes_required` specific and actionable — each item names what's missing or wrong and
what to do about it, not a vague note.
