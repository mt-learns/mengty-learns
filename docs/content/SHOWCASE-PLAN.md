# Showcase plan: a more readable site, icons everywhere, and new tracks (English, communication, career, business)

> Owner request (2026-11-27): get the site ready to **show off**. Every section gets an **icon**, pages become **more readable and productive** (flows, SVG summaries), and new content is added on **English for engineers (grammar, writing, speaking), coding craft, DevOps, security, management, interviews, communication and business/startup**.
> Constraint: the owner's Niyey app (`D:\me\projects\Niyey\content`) is **not** a source. It was only looked at for *patterns* (short lessons, a rule box, wrong→right examples, CEFR level, minutes). No text, examples or structure is copied, and nothing links to it.
> Status: **plan only**. Implementation starts after the owner approves.

---

## 1. Where we are (2026-11-27)

| | Now |
|---|---|
| Pages | 165 in 13 sections (architecture 31, security 19, design 18, process 15, frontend 13, leadership 13, platform 11, foundations 10, containers 9, kubernetes 8, ci-cd 6, iac 6, gitops 3) |
| Flashcards | 651 |
| Section icons | 10 have original clay icons. **leadership, platform and frontend have none** (BLOCKERS) |
| Home grid | Built for 10 cards. With 13+ sections it becomes a long, flat list that's hard to scan |
| Reading aids | TL;DR, `<Flow>`, `<Diagram>`, cards, quiz, related. **Missing:** reading time, "what you'll learn", one-picture summaries, section learning maps, a key-takeaways box |

## 2. Information architecture: from a flat list of sections to 4 tracks

17+ sections in one grid won't scan well. Group them into **4 tracks**, each with its own colour accent (from the Ink & Jade tokens) and icon:

| Track | Promise | Sections |
|---|---|---|
| **Build & Ship** | "Run it in production" | foundations, containers, kubernetes, iac, ci-cd, gitops, platform |
| **Design & Code** | "Write software that lasts" | **craft** (new), design, architecture, frontend |
| **Secure** | "Don't get breached" | security |
| **Work & Grow** | "Be great at the job around the code" | process, leadership, **communication** (new), **english** (new), **career** (new), **business** (new) |

- **Home:** the "Learning paths" grid becomes 4 track cards. Each one shows its sections as icon chips with page counts and progress. A **"Start here" tour** suggests a 30-minute first visit.
- **Docs sidebar:** the 4 track headings come first, then the sections, each with its icon.
- **Each section gets a landing page** with a **learning map** (an SVG path from beginner to advanced, with ✓ for pages done, using the existing progress in localStorage).

## 3. Icons (every section and track)

- **9 new original clay icons** in the existing style (DESIGN.md › Illustration rules, `public/illustrations/section-*.svg`): `leadership`, `platform`, `frontend`, `craft`, `communication`, `english`, `career`, `business`, plus one icon per track (4) = **12 new SVGs**. No emoji and no stock or copied art. Each one is checked at 24px (sidebar) and 48px (cards) in light and dark.
- **Sidebar:** every section has its icon (16/24px), and every page **kind** (note, concept, cheatsheet, lab, decision, postmortem, **lesson**) gets a small lucide glyph, so you can tell what you'll get before clicking.
- **Code:** `components/illustrations` (names, tints, titles), `lib/home-data.ts`, the section `meta.json` `icon`, and the Fumadocs sidebar icon slot.

## 4. Making reading more productive (applies to all pages)

New or upgraded page parts. Each is an MDX component, documented in DESIGN.md:

| Part | What it does | Why it helps |
|---|---|---|
| **Header strip** | level · minutes to read (computed at build time) · kind · "tested with" | Readers decide in 2 seconds whether to read now |
| **`<YouWillLearn>`** | 3 bullet outcomes at the top | Sets a goal, so reading becomes purposeful |
| **`<OnePicture>`** | A small static SVG summary of the whole page (reusing `<Diagram>`, so it follows DIAGRAM-RULES) | People remember a picture better than paragraphs (dual coding) |
| **`<KeyTakeaways>`** | 3–5 lines at the end; also fed into the flashcards | Retrieval practice and quick revision |
| **`<Example wrong right>`**, **`<Rule>`**, **`<Say>`** | For English lessons: wrong vs right with a short reason, a pronunciation note | Fast, scannable correction. The pattern is common in language teaching; the implementation is our own |
| **`<Template>`** | Copyable text (PR description, standup update, escalation email, STAR answer) with a copy button | You can use it at work today |
| **`<Dialogue>`** | A short conversation with speaker labels (meeting, interview, feedback) | Communication and English need to be heard in context |
| **`<DecisionTree>`** | A clickable yes/no flow ("past simple or present perfect?", "should I raise money?") built on `<Flow>` | Turns rules into decisions |
| **5-minute version toggle** | Shows only the TL;DR, the one-picture summary, key takeaways and cards | For revision and busy days |
| **Print / PDF cheatsheet view** | A print CSS for cheatsheet pages | Keep it on your desk |

Readability rules (added to CONTENT-PLAN §1):
- Sentences ≤ 25 words.
- One idea per paragraph, and paragraphs ≤ 4 lines.
- Plain-language words (digital.gov / Microsoft style).
- Every page longer than 8 minutes needs a `<OnePicture>`.
- Every *process* is drawn as a `<Flow>`.
- Every list of more than 5 items becomes a table or a checklist.

## 5. New content tracks (researched sources and page lists)

**Rules for every page:**
- Own words and original examples only. Sources are cited.
- Official or primary sources come first.
- CC-BY / MIT material may be *adapted with attribution*.
- Books are cited only (Shvets rule).
- No fabricated statistics.

### 5.1 English for engineers: new section `english` (about 130 micro-lessons, kind `lesson`; **full syllabus in `docs/content/ENGLISH-SYLLABUS.md`**. The summary below is superseded by it)

Audience: engineers who use English at work, with a special focus on **Khmer-speaking learners**. Research on Khmer L1 interference (Moore & Bounchan, *Khmer Learner English*, LEiA 2010) reports **dropped final consonants** (/t/ /d/ /s/), **missing plural -s** (Khmer has no plural form), **tense not marked** ("I fix it yesterday"), and **missing articles or prepositions**. These lessons target exactly those patterns.

Format per lesson:
- CEFR level (A2–B2) and minutes (5–8).
- A `<Rule>`, 6–10 work-context `<Example wrong right>` pairs, and a `<DecisionTree>` where a choice is involved.
- 3–5 cards and a quiz.
- Every example sentence is about engineering work (deploys, PRs, standups).

| Group | Lessons |
|---|---|
| Grammar that matters most | the 5 tenses that cover most work English · past simple vs present perfect (DecisionTree) · **plural -s and 3rd-person -s** · **articles a/an/the/zero** (DecisionTree) · prepositions of time and place for tech (at/on/in, by/until) · passive voice in docs and incident reports · polite modals (could/would/might) · questions and negatives · countable vs uncountable tech nouns (data, feedback, code, information) |
| Pronunciation for meetings | **final consonants** (deployed /d/, fixed /t/, tests /ts/) · word stress in tech words (deVELoper, ARchitecture, inFRAstructure) · how to say code aloud (`!==`, `=>`, `/`, `_`, version numbers, IPs, acronyms) |
| Writing at work (sources: Google Technical Writing One/Two, Microsoft Writing Style Guide, digital.gov plain language, Conventional Commits) | commit messages · PR descriptions · bug reports · Slack/async messages · emails (request, follow-up, escalation) · writing docs (Diátaxis types) · error messages and UI text |
| Speaking at work | standup updates (yesterday/today/blockers) · asking good questions · disagreeing politely · explaining a technical decision · demos and presentations · small talk with international teammates |
| Self-check | the top 15 mistakes engineers make (our own list, based on the research above) · a daily 5-minute self-check routine |

### 5.2 Coding craft: new section `craft` (about 12 pages)
Sources: Google eng-practices code review guide (CC-BY 3.0; the repo is archived but the site is live), *Refactoring* (Fowler; cited only), *A Philosophy of Software Design* (Ousterhout; cited only), Git docs, Conventional Commits.
- Naming things · functions and modules that read well · comments that earn their place · error handling patterns.
- Refactoring safely (small steps, with tests) · reading unfamiliar code · debugging method (reproduce → isolate → hypothesise → verify) as a Flow.
- Git workflow for teams (trunk-based vs GitFlow; DecisionTree) · writing a good PR · reviewing a PR (Google's "what to look for", adapted) · pairing and mob programming · working with AI coding assistants (verify, test, never paste secrets).

### 5.3 Communication: new section `communication` (about 10 pages)
Sources: Google re:Work (team effectiveness, psychological safety; Project Aristotle), Amy Edmondson on psychological safety (cited), the CCL SBI feedback model (cited), Minto's Pyramid Principle (cited). Cross-link to leadership/communication-and-listening rather than repeating it.
- Giving and receiving feedback (SBI; with `<Dialogue>`) · difficult conversations (a Flow: prepare → open → listen → agree next step).
- Writing to be read: bottom line first (pyramid) · async status updates (`<Template>`).
- Presenting technical ideas to non-technical people · running a meeting that ends with decisions.
- Saying no and negotiating scope · cross-cultural and remote communication · conflict on a team (link trust-safety-conflict) · writing a one-page proposal.

### 5.4 Career and interviews: new section `career` (about 14 pages)
Sources: Tech Interview Handbook (open source; check the license before adapting), System Design Primer (CC BY 4.0), interviewing.io's free system-design guide (cited), the STAR method (the common behavioural framework), plus the owner's learn-devops interview Q&A (already used in the platform section).
- The engineering interview loop (a Flow) · resume for engineers (impact bullets; `<Template>`).
- **Behavioural:** STAR + a reflection line, building a 10-story bank (`<Template>`), and common questions mapped to stories.
- **Coding interviews:** a pattern map (two pointers, sliding window, BFS/DFS, DP), with a DecisionTree "which pattern?" · how to think aloud.
- **System design interview:** a 45-minute framework (a Flow), back-of-envelope estimates, worked example (URL shortener).
- **Role-specific:** DevOps/SRE interview (links to platform/kubernetes pages + cards) · security engineer interview · frontend interview.
- **After the interview:** take-home assignments · negotiating an offer · the first 90 days (link leadership/first-90-days) · growing from mid to senior (the T-shaped leader link).

### 5.5 Business and startups: new section `business` (about 12 pages)
Sources: YC Startup Library and "YC's essential startup advice" (Ralston & Seibel), Startup School, Paul Graham's essays (cited, not copied), *The Lean Startup* (Ries; cited), *The Mom Test* (Fitzpatrick; cited), the Lean Canvas (Maurya; cited).
- From idea to problem (validate the problem before the product) · customer interviews that don't lie (`<Template>` question list).
- MVP and "make something people want" · finding product-market fit (signals) · a Lean Canvas worksheet.
- Pricing basics · unit economics (CAC, LTV, payback; worked example) · metrics that matter early (retention over vanity).
- Fundraising basics (bootstrapping vs raising; a DecisionTree) · company and legal basics (generic, not legal advice).
- Building a side project into a product (this site as the case study) · a founder's weekly operating rhythm.

### 5.6 Enrich existing tracks
- **DevOps:** a `ci-cd/dora-metrics` page (the four key metrics plus the **2025 DORA AI Capabilities Model**; source: dora.dev and the 2025 *State of AI-assisted Software Development* report) and `platform/sre-basics` (Google's *SRE book*, free online: SLIs/SLOs/error budgets, toil).
- **Security:** a `security/owasp-cheat-sheets-map` page (which OWASP Cheat Sheet to read for what) and `security/secure-code-review-checklist`.
- **Management:** `leadership/one-on-ones`, `leadership/hiring-interviews-as-interviewer`, and `leadership/performance-reviews`, using re:Work and the owner's key-learning playbooks.

## 6. Reading-productivity visuals to build (a priority list)

| Visual | Where | Built with |
|---|---|---|
| Track map (4 tracks → sections) | Home and the docs index | static SVG `<Diagram>` |
| Section learning map (beginner → advanced, with ✓) | Each section landing | `<Diagram>` + a progress island |
| Past simple vs present perfect | english | `<DecisionTree>` |
| Articles a/an/the/zero | english | `<DecisionTree>` |
| PR lifecycle (author → review → merge → deploy) | craft | `<Flow>` |
| Debugging loop | craft | `<Flow>` |
| Feedback conversation (SBI) | communication | `<Flow>` |
| Interview loop / 45-minute system design framework | career | `<Flow>` |
| Problem → MVP → PMF loop | business | `<Flow>` |
| Should I raise money? | business | `<DecisionTree>` |

All of them follow DIAGRAM-RULES (they fit at 265–1024px with no pan, labels ≥ 14px, no red categories) and pass the invariant tests.

## 7. Showcase readiness checklist
- [ ] The home page shows the 4 tracks with icons, a "Start here" tour, real counts and no orphan cards.
- [ ] Every section has an icon, a landing page and a learning map.
- [ ] 10 "showcase pages" polished to the top standard (one per track plus favourites). Each has a one-picture summary, a flow, a quiz and cards, and was reviewed by the lead at 360/1280 in light and dark.
- [ ] Lighthouse ≥ 0.9 on home and 3 docs pages (CI median), axe 0 serious, 0 console errors.
- [ ] OG images per page are checked (the share preview looks right).
- [ ] The PWA (v0.3.0) is shipped after the device test, so the showcase can be installed on a phone.
- [ ] The README has screenshots and a 1-paragraph pitch.

## 8. Waves and owners (after the owner approves)

| Wave | Scope | Worker | Depends on |
|---|---|---|---|
| **S0: Code: tracks, icons, reading components** | 12 icons, the tracks IA (home + sidebar), section landing pages with learning maps, `<YouWillLearn>`/`<OnePicture>`/`<KeyTakeaways>`/`<Example>`/`<Rule>`/`<Say>`/`<Template>`/`<Dialogue>`/`<DecisionTree>`, reading time, the 5-minute toggle, print CSS, the `lesson` kind in the schema | agy (or Claude) | `pwa-perf` merged (it shares app/ and components/) |
| **S1: English** | ENGLISH-SYLLABUS.md, waves E1–E5 (~130 micro-lessons) | agy | S0 components |
| **S2: Craft + Communication** | 5.2 + 5.3 (~22) | agy | S0 |
| **S3: Career + Interviews** | 5.4 (~14) | agy | S0 |
| **S4: Business** | 5.5 (~12) | agy | S0 |
| **S5: Enrich + retrofit** | 5.6, plus `<YouWillLearn>`/`<KeyTakeaways>`/`<OnePicture>` added to the 10 showcase pages and all pages over 8 minutes | agy | S0 |
| **S6: Content audit v3** | Accuracy, originality and readability-rule check of S1–S5 (report only) | agy | S1–S5 |
| **Release** | v0.4.0 (tracks + new sections) | lead | S6 fixes merged and green |

Target: about **250 pages**, **1,000+ flashcards**, 17 sections in 4 tracks, every section with an icon and a learning map.

## 9. Sources found in the research (to cite, not copy)
- Google Technical Writing courses (developers.google.com/tech-writing); Microsoft Writing Style Guide (learn.microsoft.com/style-guide); digital.gov style guide (plain language); Diátaxis (diataxis.fr).
- Google Engineering Practices: code review (google.github.io/eng-practices; CC-BY 3.0).
- Tech Interview Handbook (techinterviewhandbook.org); System Design Primer (github.com/donnemartin/system-design-primer; CC BY 4.0); interviewing.io system design guide.
- DORA: dora.dev and the 2025 *State of AI-assisted Software Development* report; Google SRE books (sre.google/books).
- Google re:Work: team effectiveness / psychological safety (rework.withgoogle.com).
- YC Startup Library and Startup School (ycombinator.com/library, startupschool.org); Paul Graham's essays (paulgraham.com).
- OWASP Cheat Sheet Series (cheatsheetseries.owasp.org).
- Khmer-learner English: Moore & Bounchan, *Khmer Learner English: A Teacher's Guide to Khmer L1 Interference* (LEiA, 2010); Cambridge *English Grammar in Use* common-error cards (for the method; L1-specific).
Every page links its actual sources. The worker re-checks each one with a live fetch (URLs and licences change).
