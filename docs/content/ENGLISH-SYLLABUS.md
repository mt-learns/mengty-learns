# English for Engineers: full syllabus (section `english`)

> Owner request (2026-11-27): the English section should cover **all the grammar plus tips**, from the passive onwards, in a **quick-to-learn** format, with sentence **patterns**, **presentations**, meetings, writing and more.
> It extends SHOWCASE-PLAN §5.1. Every example sentence is about engineering work. Original content only (Niyey isn't a source).
> **Learner focus:** Khmer-speaking engineers. Lessons marked **[KH]** target known Khmer L1 interference: final consonants, plural -s, tense marking, articles, prepositions, and the verb *be* (Moore & Bounchan, LEiA 2010).

## 1. How every lesson is built (quick learning)

| Part | Size | Purpose |
|---|---|---|
| Header | CEFR level (A1–C1) · 3–7 min · tags | Choose quickly |
| `<Rule>` | 2–4 lines, plus one formula (e.g. `have/has + past participle`) | The whole idea at a glance |
| **Wrong → right** `<Example>` | 6–10 pairs, all work context, each with a 1-line reason | Learn by correction |
| **Pattern bank** | 5–10 ready-to-use sentence patterns with blanks | Speak and write today |
| `<DecisionTree>` | Only when there's a choice (tense, article, preposition) | Turns a rule into a decision |
| **Practice** | A 5-question quiz (fill the gap / choose / fix the sentence) | Retrieval |
| **Cards** | 3–5 flashcards into `/review` | Spaced repetition |
| `<KeyTakeaways>` | 3 lines | Revision |

Each group also gets:
- **One-page cheatsheet:** printable, every rule in the group on one page.
- **Mixed review quiz:** 15 questions across the group's lessons.

There's also a **placement check**: 20 questions that send you to the right starting group.

## 2. Grammar: complete map (about 60 lessons)

### G1. Sentence basics (A1–A2)
1. Word order: subject–verb–object, and where time and place go ("We deployed the fix to production yesterday")
2. **The verb *be*: never drop it** [KH] ("The build **is** green", not "The build green")
3. *There is / there are* ("There are two failing tests")
4. Questions: yes/no, wh-questions, and the auxiliary *do/does/did*
5. Negatives: *don't / doesn't / didn't / isn't / haven't*
6. Short answers and question tags ("It works, doesn't it?")
7. Imperatives for docs and instructions ("Run the script. Don't commit secrets.")

### G2. Nouns, articles, quantity
8. **Plural -s and its 3 sounds** /s/ /z/ /ɪz/ [KH] ("two server**s**", "three branch**es**")
9. Countable vs uncountable tech nouns: data, code, feedback, information, software, equipment, advice, research
10. **Articles a/an/the/zero, part 1**: first mention vs known thing [KH] (DecisionTree)
11. Articles part 2: generic statements, product names, acronyms ("an API", "a URL", "an SSH key": sound, not letter)
12. Quantifiers: some/any, much/many, a few/a little, few/little, enough
13. Possessives: 's vs of ("the user's token", "the root of the problem")
14. Pronouns and *it/this/that* for referring back in docs

### G3. Verbs and tenses (core)
15. Present simple: facts, how a system works, **3rd-person -s** [KH] ("The service return**s** JSON")
16. Present continuous: now / this sprint ("I'm working on the login bug")
17. **Past simple: regular -ed and its 3 sounds /t/ /d/ /ɪd/** [KH] ("fix**ed** /t/, deploy**ed** /d/, test**ed** /ɪd/")
18. The 40 irregular verbs engineers use most (build–built, run–ran, write–wrote, break–broke, find–found…)
19. **Present perfect vs past simple** (DecisionTree: is there a finished time?)
20. Present perfect + for/since/yet/already/just ("I've just pushed it", "Has QA tested it yet?")
21. Present perfect continuous ("I've been debugging this for two hours")
22. Past continuous + past simple in incident stories ("We were deploying when the database went down")
23. Past perfect for timelines in postmortems ("The cache had expired before the request arrived")
24. Future: *will* (decision/promise) vs *going to* (plan) vs present continuous (arrangement) vs present simple (schedules: "The release starts at 9")
25. Future continuous and future perfect for planning ("By Friday we'll have migrated all users")
26. Tense review: one incident told in 6 tenses (a timeline Flow)

### G4. Modals (politeness and certainty)
27. can/could/be able to: ability and requests
28. **Polite requests and offers**: could/would/would you mind/shall I ("Would you mind reviewing my PR?")
29. must/have to/need to/don't have to/mustn't: rules vs obligation (security policies)
30. should/ought to/had better: advice in code review
31. **Certainty**: might/may/could/must/can't + have done, for debugging guesses ("It must have been the cache")
32. Softening and hedging: *I think, it seems, probably, we might want to…*

### G5. Voice and reporting
33. **Passive voice, part 1**: forms in every tense ("The bug was fixed", "The data is encrypted", "It will be deployed")
34. **Passive voice, part 2**: when to use it in docs, incident reports and blameless postmortems, and when active voice is clearer (Google/Microsoft style)
35. Passive with modals and *get* ("It must be reviewed", "The build got cancelled")
36. Causative *have/get something done* ("We had the certificate renewed")
37. Reported speech for meeting notes ("She said the API was ready", "He asked whether…")
38. Reporting verbs: suggest, recommend, confirm, mention, explain + the correct pattern

### G6. Linking ideas (writing that flows)
39. Conjunctions: and/but/so/because/although/while
40. **Linkers for docs and emails**: however, therefore, as a result, in addition, instead, otherwise
41. **Conditionals 0/1** for docs and if-statements in plain English ("If the token expires, the client retries")
42. Conditionals 2/3 for trade-offs and postmortems ("If we had added an alert, we would have caught it")
43. Mixed conditionals, *unless*, *as long as*, *provided that*
44. Relative clauses who/which/that/whose, defining vs non-defining (commas)
45. Purpose and result: to/in order to/so that/such…that
46. Contrast and concession: although/despite/even though/whereas

### G7. Word forms and small words
47. **Prepositions of time**: at/on/in, by/until, for/since, during/within [KH]
48. **Prepositions of place and tech**: in a file, on a server, at the top, in the cloud, on GitHub, via/through
49. Dependent prepositions: depend on, responsible for, interested in, familiar with, compatible with
50. Phrasal verbs engineers use (set up, roll back, log in/login, look into, figure out, back up/backup, shut down, spin up, run into)
51. Gerund vs infinitive (avoid doing, decide to do, stop doing vs stop to do)
52. Adjectives vs adverbs, and *-ed* vs *-ing* (bored/boring, the system is **slow** / it runs **slowly**)
53. Comparatives and superlatives in benchmarks ("2× faster than", "the most reliable", "not as fast as")
54. Word families (deploy, deployment, deployable; config, configure, configuration)
55. Noun stacks in tech writing, and when to break them up ("the user authentication token refresh failure" → "a failure when refreshing…")

### G8. Advanced / precise (B2–C1)
56. Emphasis: cleft sentences ("What broke the build was…", "It was the cache that…")
57. Inversion for formal writing (rarely needed; recognise it)
58. Subjunctive and formal requests ("We recommend that every service **use** TLS")
59. Nominalisation: when it helps and when it hurts clarity
60. Punctuation for engineers: commas, semicolons, colons, dashes, quotes around code, and the Oxford comma (Microsoft style)

## 3. Tips and fast fixes (about 15 micro-lessons, 2–3 min each)
- **Top 20 mistakes engineers make**, with a fix for each (our own list, built from the [KH] research plus common learner errors): "I have deployed it yesterday", "Two server", "The API return JSON", "Please kindly…", "I am agree", "Discuss about", "Explain me", "Do the needful", "Revert back"…
- **False friends and overused words**: actually, basically, just, very; *it's* vs *its*; *then* vs *than*; *affect* vs *effect*; *loose* vs *lose*; *login* (noun) vs *log in* (verb); *setup* vs *set up*; *backup* vs *back up*.
- **Make it shorter**: cut filler words, prefer verbs to nouns, one sentence = one idea (Google Technical Writing).
- **Polite but direct**: ladders from too blunt → right → too indirect, for asking, refusing, disagreeing and pushing back.
- **Numbers, dates, versions, units** ("v1.2.3", "2–3 days", "99.9%", "8 GiB", "Q3", time zones, 24h vs am/pm).
- **Spelling patterns that hurt in code reviews** (US vs UK in code: color/colour; stay consistent).
- **How to learn faster**: shadowing, a 10-minute daily routine, keeping a mistake log (template), and using flashcards from this site.

## 4. Sentence pattern banks (copy-ready, about 12 banks × 10–20 patterns)
Each bank is a `<Template>` page with fill-in-the-blank patterns and one example each:
1. **Standup**: "Yesterday I ___. Today I'm going to ___. I'm blocked by ___."
2. **Asking for help**: "Do you have 5 minutes to ___?" · "I've tried ___ and ___, but ___."
3. **Code review comments (author and reviewer)**: "Could we ___ instead? That way ___." · "Nit: ___." · "Good catch, fixed in ___."
4. **Disagreeing politely**: "I see your point, but ___." · "Have we considered ___?"
5. **Estimating and deadlines**: "It should take about ___, assuming ___." · "We're at risk of missing ___ because ___."
6. **Bug reports**: Steps / Expected / Actual / Environment patterns
7. **Incident updates**: "We're investigating ___. Impact: ___. Next update at ___."
8. **Emails**: request, follow-up, reminder, escalation, apology, thank-you
9. **Slack / async**: "No need to reply." · "TL;DR: ___." · "Heads-up: ___."
10. **Meetings**: opening, keeping on track, clarifying, summarising, closing with owners and dates
11. **Interviews**: "Tell me about yourself" structure, STAR answer patterns, questions to ask the interviewer
12. **Negotiation and saying no**: "I can do ___ by ___ if we drop ___."

## 5. Presentations and demos (about 8 lessons)
1. Structure of a technical talk: hook → problem → solution → demo → result → next steps (a Flow)
2. Signposting language ("First…, Moving on to…, To sum up…")
3. Describing a diagram or architecture aloud ("On the left you can see…, Requests flow from…")
4. Describing numbers and charts (rise, drop, peak, plateau, double; "latency dropped by 40%")
5. Live demo language, and what to say when the demo breaks
6. Handling Q&A: clarifying, buying time, "I don't know, but I'll find out"
7. Slides that read well (one idea per slide, short titles as sentences)
8. Pronunciation for presenters: pausing, stress on key words, and slowing down on numbers

## 6. Meetings, calls and speaking (about 8 lessons)
Small talk with international teammates · joining a call and turn-taking · interrupting politely · checking understanding ("So what you're saying is…") · when you didn't catch something ("Sorry, could you repeat the last part?") · giving updates to managers (bottom line first) · 1:1s with your lead · cross-cultural notes (directness levels, silence, time zones).

## 7. Writing at work (about 10 lessons)
Sources: Google Technical Writing One/Two, Microsoft Writing Style Guide, digital.gov plain language, Conventional Commits, Diátaxis.
Commit messages · PR descriptions · issue and bug reports · README structure · how-to vs explanation vs reference (Diátaxis) · error messages and UI microcopy · changelogs and release notes · design docs/ADRs in clear English · emails · proofreading checklist (and using tools without losing your voice).

## 8. Pronunciation and listening (about 10 lessons)
**Final consonants** [KH] · past -ed /t/ /d/ /ɪd/ [KH] · plural -s /s/ /z/ /ɪz/ [KH] · consonant clusters (tests, scripts, months) [KH] · word stress in tech words · sentence stress and rhythm · intonation for questions and lists · how to say code, symbols, versions, URLs, IPs and acronyms aloud (SQL "sequel" vs "S-Q-L", GUI, YAML, JSON, kubectl, nginx, Linux) · minimal pairs that cause confusion (ship/sheep, live/leave, sheet/seat) · listening to fast meetings (reductions: gonna, wanna, kinda).

## 9. Vocabulary banks (about 8 pages, also fed into flashcards)
Software lifecycle verbs · DevOps and incident vocabulary · security vocabulary · business and product words (stakeholder, roadmap, scope, KPI) · collocations (make a decision, run a test, raise an issue, file a bug, meet a deadline) · phrasal verbs (part 2) · formal vs informal pairs (ask/enquire, get/obtain, need/require) · words that are often misused in tech English.

## 10. Size, order and visuals
| Group | Lessons | Visuals |
|---|---|---|
| Grammar G1–G8 | ~60 | DecisionTrees: tense, articles, prepositions of time, conditionals. Timeline Flow for the tense review |
| Tips | ~15 | Politeness ladder diagram |
| Pattern banks | ~12 | Template components |
| Presentations | ~8 | Talk-structure Flow |
| Meetings and speaking | ~8 | Meeting-flow Flow |
| Writing | ~10 | PR / bug-report anatomy diagrams |
| Pronunciation and listening | ~10 | Mouth/sound charts as original SVG (simple) |
| Vocabulary | ~8 | — |
| **Total** | **~130 micro-lessons, plus a placement check and 9 group cheatsheets** | |

**Waves (agy, each one commit per lesson; replaces the single "S1" in SHOWCASE-PLAN §8):**
- **E1:** G1–G3, plus the Top-20 mistakes and the placement check (the highest impact for Khmer learners).
- **E2:** G4–G5, plus Pattern banks 1–6, plus Presentations.
- **E3:** G6–G7, plus Pattern banks 7–12, plus Meetings.
- **E4:** G8, plus Writing, plus Pronunciation and listening, plus Vocabulary, plus group cheatsheets.
- **E5:** English content audit: grammar accuracy (checked against Cambridge/Oxford/Merriam-Webster dictionary and grammar references), natural-sounding examples, CEFR levels, and quiz answers.

**Quality rules for English content:**
- Every grammar claim is checked against a recognised reference (Cambridge Dictionary grammar pages, Oxford Learner's Dictionaries, the British Council LearnEnglish grammar pages, Merriam-Webster) and cited.
- Examples must be **natural workplace English**: no textbook-only sentences.
- US spelling, with notes where UK English differs.
- No invented statistics (the "% of usage" figures are only used if the worker can cite a corpus source; otherwise they're left out).
- Accessibility: example pairs use more than colour (✗/✓ icons plus text), and audio is optional (later: the browser speech synthesis "Listen" button, no recordings needed).
