# Methodology: the concepts behind the framework

This file explains the reasoning behind the mindset rules in SKILL.md. Read it when a
decision hinges on *why* — especially anything involving source context, the central
entity, contextual flow, or how authority actually accrues. Table of contents:

1. Topical authority — the goal everything serves
2. Source context — the identity that constrains the map
3. Central entity and central search intent
4. Macro vs micro context
5. Entities, attributes, and triples
6. Query semantics and search intent
7. Topical map: core section vs outer section
8. Contextual vector, hierarchy, and flow
9. Cost of retrieval and information responsiveness
10. Momentum and historical data
11. Unique information gain
12. Cannibalization
13. Common ways people get this wrong

---

## 1. Topical authority — the goal everything serves

Topical authority is the state where a search engine trusts a site as *the* source for a
topic, across the whole topic, not just for a handful of queries. You reach it by covering
the topic completely and accurately, with consistent quality, processed in a focused window
of time. Ranking for one keyword is a side effect; the asset is the trust over the domain.

Everything else in this methodology is in service of this. When a decision is unclear, ask:
"does this make the site more completely and trustworthily the source for the topic?" If
yes, do it. If it just chases a keyword, it's probably noise.

## 2. Source context — the identity that constrains the map

Source context is the website's identity: what it is, who it serves, what it sells or
exists to do, and therefore what it is *allowed* to be authoritative about. A supplement
brand has a different source context than a medical journal even when both write about
creatine — so their maps, angles, and depth differ.

Source context is the first input to any map. It decides:
- The central entity (below).
- What belongs in the core section vs the outer section.
- Which claims are credible coming from this site.

Building pages the source context can't support dilutes authority. Flag those rather than
including them.

## 3. Central entity and central search intent

The **central entity** is the single entity the whole site (or section) orbits. Every page
connects back to it through a chain of relationships. For a running-shoe retailer, the
central entity might be "running shoes"; every page relates to it.

The **central search intent** is the dominant thing users come to the site to accomplish
(e.g. "choose and buy the right running shoe"). It threads through the entire map so the
coverage stays coherent instead of sprawling into unrelated topics.

Both are chosen from the source context, and both act as a filter: a candidate page that
doesn't connect to the central entity *and* serve (or support) the central search intent
doesn't belong.

## 4. Macro vs micro context

- **Macro context** = the whole site's context — its central entity, its source context,
  the overall topic it owns.
- **Micro context** = an individual page or section's specific context.

They must agree. A page's micro context should be a coherent slice of the macro context.
When they conflict (a page wanders off-topic, or contradicts the site's positioning), that's
a structural error to fix, not a stylistic one.

## 5. Entities, attributes, and triples

Treat information as entities connected by predicates to other entities or values:
**subject → predicate → object**. "Creatine → increases → muscle strength."

- **Entities**: the nouns the topic is about (people, things, concepts, places, products).
- **Attributes**: the properties of an entity (creatine's dosage, timing, forms, side
  effects). Complete coverage means covering all material attributes.
- **Named entities**: specific, recognized entities (brands, studies, standards) that add
  precision and credibility.
- **Relationships**: how entities connect — causal, comparative, part-of, used-for.

Comprehensive coverage = covering an entity's attributes and its relationships to the
entities around it. Gaps in attributes are gaps in authority.

## 6. Query semantics and search intent

Queries are surface forms of underlying intents. Group them by the intent they express, not
by string similarity. A useful lens:

- **Representative queries**: the clearest expression of an intent — the question a section
  should answer head-on.
- **Query templates / phrase taxonomy**: the patterns queries take ("best X for Y", "X vs
  Z", "how to X", "is X safe"). Each pattern often maps to a distinct section or page.
- **Intent types**: informational, commercial, transactional, navigational — and finer
  sub-intents within those.

Coverage means satisfying the range of intents around the central entity, each in the place
and format that fits it.

## 7. Topical map: core section vs outer section

The topical map is the structured set of all pages, split into two zones:

- **Core section**: pages closest to the central entity and to monetization / the central
  search intent. These directly serve the site's purpose and convert.
- **Outer section**: pages that build context, cover supporting and adjacent entities, and
  establish breadth of knowledge. They earn the authority that makes the core section rank.

Process the **core section first**, then the outer section. The core defines the identity;
the outer reinforces it. Each node in the map is a contextual vector (next section).

## 8. Contextual vector, hierarchy, and flow

- **Contextual vector**: a single node's unique combination of central entity + attribute +
  search intent. It's what makes a page distinct. Two pages with the same vector = one
  redundant page.
- **Contextual hierarchy**: the parent / child / sibling structure of the map. Broad
  parents, specific children, parallel siblings. Nothing floats.
- **Contextual flow**: the order in which context is built and connected — across the map
  and within a page. Definition before use cases, core before outer, cause before effect.
  Internal links follow this flow; they exist to carry context along it, not decoratively.

## 9. Cost of retrieval and information responsiveness

A search engine spends effort retrieving, parsing, and trusting an answer. Lowering that
cost helps you.

- **Information responsiveness**: answer the actual question, immediately, in the format the
  question implies (a comparison wants a table, a definition wants a sentence, a process
  wants ordered steps). Distance between a heading's question and its answer should be near
  zero — the first sentence answers it.
- **Cost of retrieval** drops with clarity, consistent structure, factual density, and
  internal consistency. Fluff, burying the answer, and contradictions raise it.

This is why structure is treated as a ranking factor, not cosmetics.

## 10. Momentum and historical data

Authority accrues over time through consistency. Publishing the topical map in a focused,
steady cadence — rather than sporadically — builds historical signals that the site is an
active, reliable source for the topic. Completeness plus consistency over a window beats
scattered one-off posts. When advising on rollout, favor finishing a coherent section
densely over sprinkling unrelated pages.

## 11. Unique information gain

Authority comes partly from offering information competitors don't — covered attributes
they skipped, edge cases they ignored, misconceptions they never corrected, original data
or synthesis. When planning or auditing, actively hunt for this gain; "same as the top ten
results" is not authority, it's parity.

## 12. Cannibalization

Cannibalization is when two pages compete for the same intent / contextual vector, splitting
signals and confusing the engine about which to rank. It's the most common structural sin.
Prevent it at the map stage (every node = a distinct vector) and catch it at the audit stage
(check each page against the rest of the map). The fix is usually merge, differentiate, or
re-point — not "publish both and hope".

## 13. Common ways people get this wrong

- Treating the map as a keyword list instead of an entity-and-intent structure.
- Writing outer-section content before the core section exists.
- Adding pages the source context can't credibly support.
- Optimizing for volume and ignoring whether the intent is actually served.
- Letting two pages drift into the same vector (cannibalization).
- Burying answers under generic intros, raising cost of retrieval.
- Stopping at parity with competitors instead of adding unique information gain.
