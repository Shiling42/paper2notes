/* =============================================================================
 * build_workflow_template.js
 * -----------------------------------------------------------------------------
 * A GENERALIZED, REUSABLE multi-agent BUILD workflow that expands a terse paper
 * (or a pile of dense research notes) into a self-contained, fully-proved,
 * professionally typeset LECTURE NOTE — adversarially verified against a
 * machine-checked ground-truth numbers sheet and a final acceptance rubric.
 *
 * WHAT IT DOES (pipeline overview)
 *   Phase A  Scaffold     preamble + master file + build scripts + notation contract
 *   Phase B  Example      author a numeric verifier, RUN it, write numbers.md (ground truth)
 *   Phase B2 Literature   (parallel with B; skipped when BIB='off') build + verify the
 *                         citations ledger — refs.bib + citations.md, the literature
 *                         analogue of numbers.md: no \cite outside the ledger, nothing in
 *                         the ledger without a lookup-verified identifier (anti-fabrication)
 *   Phase C  Draft+Verify per chapter, PIPELINED: draft -> 3 adversarial lenses
 *                         (math / numeric / pedagogy) in parallel -> apply fixes -> recompile
 *                         (light mode: ONE combined lens instead of three — see MODE)
 *   Phase D  Assemble     write appendices, stitch everything, unify notation, full 3-pass build
 *   Phase E  Synthesis    write Section I — the PRL-style opening article — from the FINISHED
 *                         chapters; the chapter marked synthesis:true in CHAPTERS is skipped
 *                         by the per-chapter drafting pipeline (Phase C) and written here;
 *                         then compress Section I into the 1-2 page zero-formula Preface
 *   Phase F  Typeset      back up the plain preamble, layer the professional typographic design
 *                         (typesetting_guide.md discipline) in a sandbox, LOOK, then apply live
 *                         (non-fatal: on failure the run logs it and continues with the plain
 *                         preamble; the outcome is surfaced in the final return object)
 *   Phase G  Figures      render the full PDF, visually inspect every figure, fix
 *   Phase H  Referee      score the rubric; bounded fix loop until all HARD GATES pass
 *                         AND the score clears THRESHOLD
 *
 * PROVENANCE
 *   This is the generalized distillation of a real, successful run that turned a
 *   terse PRX paper ("The Mpemba Effect as Topological Frustration") into a
 *   131-page lecture note with a clean build and all acceptance gates green.
 *   The two real scripts it distills:
 *     - the build:        mpemba-lecture-notes-wf_7131ff49-2e6.js  (627 lines)
 *     - the remediation:  mpemba-notes-remediation-wf_b794f6de-593.js (217 lines)
 *   The Mpemba run is used below ONLY as the worked CONFIG example. Everything
 *   structural is project-agnostic.
 *
 * HOW TO ADAPT
 *   Edit ONLY the CONFIG block (clearly marked, at the top). In order:
 *     0. KNOBS         — MODE ('full' | 'light' cheap first pass), BIB (the
 *                        literature layer: 'auto' | 'inherit' | 'discover' | 'off'),
 *                        and SKILLREF (optional path to the skill package root;
 *                        unlocks the shipped scaffold templates + professional preamble).
 *     1. PATHS         — OUT (output dir), PAPER (source), CODE (verifier dir),
 *                        SOURCES (extra dense-notes files), FIGS (reusable PDFs).
 *                        The defaults are PLACEHOLDERS; the script refuses to
 *                        launch until they are set (or passed via args).
 *     2. TOPIC         — TITLE / AUTHOR / AUDIENCE (one sentence: what the reader
 *                        already knows) and the PALETTE.
 *     3. STANDARDS     — the non-negotiables list (self-contained, proofs, etc.).
 *     4. CONCEPTS      — the named objects that MUST be built from scratch.
 *     5. EXAMPLE_SPEC  — the running example + exactly what the verifier must
 *                        compute and cross-check (the linchpin of correctness).
 *     6. CHAPTERS      — the per-chapter array (id, title, source, covers, figures);
 *                        the entry marked synthesis:true is Section I, written LAST
 *                        by the Synthesis phase (the drafting pipeline skips it).
 *     7. RUBRIC        — the acceptance dimensions + hard gates + THRESHOLD
 *                        (numeric acceptance bar, default 90/100).
 *   The agent prompts read everything else off CONFIG; you should not need to
 *   touch the phase code unless you are changing the pipeline shape itself.
 *
 * HOW TO LAUNCH
 *   This file is a WORKFLOW SCRIPT, executed by the Workflow tool — NOT plain
 *   node. The runtime injects the globals: agent(), parallel(), pipeline(),
 *   phase(), log(), and args. Top-level await is allowed. Save your adapted copy
 *   somewhere the Workflow tool can see it and invoke it; pass overrides via the
 *   optional `args` object (see the CONFIG `args` merge below).
 *
 * JS / RUNTIME CONSTRAINTS (do not violate — the sandbox forbids these)
 *   - NO Date.now(), NO Math.random(), NO new Date() for live time, NO process,
 *     NO require()/import, NO network, NO direct fs. `meta` must be a pure literal
 *     (no computed values). All real work happens inside agent() prompts.
 *   - Determinism: loop bounds and counts must be literals or derived from CONFIG,
 *     never from a clock or RNG.
 *   - Concurrency primitives provided by the runtime:
 *       agent(prompt, opts)      -> Promise<result>   (opts: {label, phase, schema, effort, agentType})
 *       parallel([() => p, ...])  -> Promise<results[]> (fan-out, all at once)
 *       pipeline(items, stage1, stage2, ...) -> Promise<results[]>
 *               each stageK is (prevResult, origItem, index) => Promise; stages of
 *               DIFFERENT items overlap (item N at stage 2 while item N+1 is at stage 1).
 *       phase(title)             -> marks a phase boundary for the UI
 *       log(string)              -> progress line
 *   - `effort: 'high'` for heavy reasoning agents (drafting, proving, refereeing);
 *     omit it for cheaper mechanical lenses.
 *   - A `schema` makes agent() return a parsed object matching that JSON Schema;
 *     without one it returns a string. Agents can still fail / return null — always
 *     guard with `r && r.field` and `.filter(Boolean)`.
 *   - PARSE-CHECKING: this file is NOT parseable by plain node / `node --check` BY
 *     DESIGN — it combines `export const meta`, top-level await, and a top-level
 *     `return`, which is valid only because the Workflow runtime wraps the script
 *     body in an async function. To validate it, launch it with the Workflow tool;
 *     for a mere parse check, copy the file and temporarily wrap everything BELOW
 *     the meta export in `async function main () { ... }`. Never restructure the
 *     real file that way.
 *
 * ENVIRONMENT GOTCHAS (bake these into the agent prompts, as the real run did)
 *   - Paths containing [ ] (e.g. "[260619_Mpemba]...") MUST be double-quoted in bash.
 *   - pdflatex may not be on PATH. Resolve it PROBE-STYLE (the scaffolded build
 *     scripts below are specified to do the same): `command -v pdflatex` if on
 *     PATH; else /Library/TeX/texbin/pdflatex (macOS MacTeX); else the glob
 *     /usr/local/texlive/<year>/bin/<arch>/pdflatex (Linux TeX Live). TEXBIN in
 *     CONFIG is the first fallback hint. pdftoppm (used to render PDF pages for
 *     visual checks) ships with poppler (macOS: brew install poppler; Linux
 *     package: poppler-utils).
 * ========================================================================== */

// `meta` MUST be a pure literal (the runtime reads it statically before running).
export const meta = {
  name: 'paper2notes-build',
  description:
    'Expand a terse paper / dense notes into self-contained, fully-proved, professionally typeset lecture notes, adversarially verified against a machine-checked numbers ground-truth and an acceptance rubric',
  phases: [
    { title: 'Scaffold', detail: 'preamble, master file, build scripts, notation contract' },
    { title: 'Example', detail: 'author + run the numeric verifier; write numbers.md (ground truth)' },
    { title: 'Literature', detail: 'build + verify the citations ledger (refs.bib + citations.md) — the literature analogue of numbers.md' },
    { title: 'Draft', detail: 'one agent per chapter writes full pedagogical text + figures' },
    { title: 'Verify', detail: '3 adversarial lenses per chapter (math/numeric/pedagogy), then fix' },
    { title: 'Assemble', detail: 'appendices, stitch, unify notation, full pdflatex build' },
    { title: 'Synthesis', detail: 'write Section I — the PRL-style opening article — from the finished chapters, then compress Section I into the 1-2 page zero-formula Preface' },
    { title: 'Typeset', detail: 'back up plain preamble, layer the professional design, sandbox-build, visually inspect, apply live' },
    { title: 'Figures', detail: 'render full PDF, visually check every figure, fix' },
    { title: 'Referee', detail: 'score the acceptance rubric; loop fixes until hard gates pass and the score clears the threshold' },
  ],
}

/* ===========================================================================
 * ============================  CONFIG  =====================================
 * ===========================================================================
 * EVERYTHING project-specific lives below. Adapt this block; leave the phase
 * code (after the CONFIG END marker) alone for a standard run.
 *
 * The values shown are the REAL Mpemba run, kept as a concrete worked example.
 * Replace them for your paper. `args` (injected by the launcher) can override any
 * scalar path at invocation time without editing the file.
 * ------------------------------------------------------------------------- */

const A = (typeof args === 'object' && args) ? args : {}

// ---- 0. KNOBS --------------------------------------------------------------
// MODE : 'full' (default) or 'light'. Light is a CHEAP FIRST PASS: one combined
//        verification lens per chapter (math+numeric+pedagogy in a single
//        adversarial prompt) instead of three parallel lenses, a single referee
//        round, and no figure-review loop. Light NEVER trims: the Phase B
//        ground-truth numbers (including the independent audit), the Phase B2
//        citations ledger + its audit (only the T3 claim-support spot-checks
//        are full-mode-only), clean 3-pass builds, the Synthesis phase
//        (Section I is ALWAYS written from the finished chapters, and the
//        Preface steps — writer, blind insight-test, fixer — are part of
//        Synthesis and NEVER trimmed), or the Typeset phase. Light output is
//        DRAFT GRADE — rubric compliance not claimed.
const MODE = A.mode === 'light' ? 'light' : 'full'
// BIB  : the LITERATURE LAYER knob — 'auto' (default) | 'inherit' | 'discover' | 'off'.
//        The layer builds a SECOND ground-truth pair next to numbers.md: refs.bib +
//        citations.md (every entry identifier-verified by an actual lookup; see Phase B2).
//        - 'inherit'  : ledger built ONLY from the source paper's own bibliography.
//        - 'discover' : inherit whatever exists, then fill load-bearing gaps by
//                       search-grounded discovery (for drafts with thin/no bibliography).
//        - 'auto'     : inherit if the source carries a usable bibliography, else discover
//                       (resolved by the Literature agent, recorded in citations.md).
//        - 'off'      : no literature layer — the pre-2.5 behavior; the notes cite nothing.
//        The anti-fabrication rule is absolute in every mode: no \cite outside
//        citations.md, nothing in citations.md without a resolved identifier.
const BIB = ['off', 'inherit', 'discover', 'auto'].includes(A.bib) ? A.bib : 'auto'
// SKILLREF : OPTIONAL absolute path to the paper2notes skill package
//        root (the directory containing SKILL.md and references/). When set:
//        - Phase A ADAPTS the shipped scaffold templates in
//          references/scaffold/ instead of regenerating them from prose;
//        - the Typeset phase uses the shipped, compile-tested
//          references/preamble_lecture_notes.tex instead of authoring the
//          professional preamble from the embedded spec.
const SKILLREF = A.skillref || ''

// ---- 1. PATHS ------------------------------------------------------------
// OUT     : the lecture-notes project directory (created by the scaffold agent).
// PAPER   : the terse source paper (.tex preferred so macros/line refs are usable).
// CODE    : a directory of runnable scripts that produce the ground-truth numbers.
// SOURCES : any extra dense-notes / machinery files chapters may quote (array).
// FIGS    : directory of existing publication PDFs you may reuse as figure panels.
// TEXBIN  : first-choice pdflatex location hint (the build scripts probe further).
//
// The defaults below are PLACEHOLDERS on purpose — a guard right after CONFIG END
// aborts the run before any agent is spawned if they are still unset. For
// reference, the REAL Mpemba run (the worked example this template distills) used:
//   PAPER   .../Forest/[260619_Mpemba]mpemba_topology/mpemba_topology_prx.tex
//   OUT     .../[260619_Mpemba]mpemba_topology/.claude/worktrees/naughty-hofstadter-7be472/mpemba_lecture_notes
//   CODE    .../[260619_Mpemba]mpemba_topology/code
//   FIGS    .../[260619_Mpemba]mpemba_topology/figs
//   SOURCES [.../part1_forest_spectral_dictionary.tex, .../part2_perturbation_theory.tex]
// (all under /Users/sliang/Library/CloudStorage/Dropbox/Transfer/code/Agent_Ground/,
// OUT and SOURCES inside a throwaway session worktree — exactly why live personal
// defaults must not ship: set YOUR paths here or pass them via args.)
const PAPER  = A.paper  || '/ABSOLUTE/PATH/TO/source_paper.tex'
const OUT    = A.out    || '/ABSOLUTE/PATH/TO/lecture_notes_output'
const CODE   = A.code   || '/ABSOLUTE/PATH/TO/verifier_code_dir'
const FIGS   = A.figs   || '/ABSOLUTE/PATH/TO/existing_figs_dir'
// Extra machinery the chapters may quote (dense notes, prior parts, reports).
// Empty array is a valid default — the prompts render it as '(none)'.
const SOURCES = A.sources || []
const TEXBIN = A.texbin || '/Library/TeX/texbin'

// Derived paths used throughout (do not normally need editing).
const NUMBERS  = OUT + '/numbers.md'      // SINGLE SOURCE OF TRUTH for every number
const CITATIONS = OUT + '/citations.md'   // SINGLE SOURCE OF TRUTH for every citation (BIB != 'off')
const BIBFILE  = OUT + '/refs.bib'        // the BibTeX database behind citations.md
const CONTRACT = OUT + '/contract.md'     // notation & style contract every agent obeys
const MASTER   = OUT + '/lecture_notes.tex'
const PREFACE  = OUT + '/preface.tex'     // 1-2 page zero-formula Preface (Synthesis writes it LAST)
const chFile   = (id) => `${OUT}/chapters/${id}.tex`
const sourcesList = SOURCES.join(', ') || '(none)'

// ---- 2. TOPIC / TONE -----------------------------------------------------
// REPLACE FOR YOUR PAPER: TITLE, AUTHOR, AUDIENCE (the defaults are the Mpemba worked example).
const TITLE    = A.title  || 'The Mpemba Effect as Topological Frustration: A Lecture-Note Derivation'
const AUTHOR   = A.author || 'Lecture Notes'
// AUDIENCE: one sentence — exactly what the reader already knows. This calibrates
// what must be built from scratch vs. assumed. THE most important tone knob.
const AUDIENCE = A.audience ||
  'a graduate student who knows only the basics of the Mpemba effect (the Lu-Raz spectral / eigenmode picture; strong effect = slow-mode overlap a_1(T_M)=0) plus undergraduate linear algebra and Markov chains'
// Figure palette (hex). Keep it small and clean. The color NAMES must match the
// \definecolor names in the professional preamble (references/preamble_lecture_notes.tex)
// and the figure_techniques.md archetypes, so agent-authored TikZ survives the
// Typeset-phase preamble swap unchanged.
const PALETTE  = A.palette || 'navy=#1f3b73, mpred=#c0392b, teal=#16887b, gold=#b8860b, inkgray=#4a4a4a'

// ---- 3. STANDARDS (the non-negotiables) ----------------------------------
// Every agent gets this verbatim. Edit the bullet list for your project, but
// KEEP the four pillars: self-contained, every theorem fully proved, general
// theory first / example second, physics-first (motivation before algebra).
// REPLACE FOR YOUR PAPER: the KEY CORRECTNESS TRAP paragraph at the bottom (or pass args.correctnessTrap).
const STANDARDS = `
GOAL. Turn the terse source into SELF-CONTAINED LECTURE NOTES that ${AUDIENCE}
can follow END TO END. A secondary aim: this slow, fully-unpacked re-derivation
should EXPOSE ANY ERRORS in the original result.

NON-NEGOTIABLE STANDARDS (the user enforces these; a reviewer will check them):
1. SELF-CONTAINED. Every load-bearing concept is BUILT FROM SCRATCH with intuition
   + a tiny verification, NEVER merely cited. (The specific objects that must be
   built up for THIS document are listed under CONCEPTS below.) If you use it, you
   explain it.
2. EVERY THEOREM FULLY EXPANDED. State precise assumptions; give physical intuition;
   then a GAP-FREE, step-by-step proof in which it is explicit WHERE each assumption
   is used. No "it can be shown", no "standard", no "sketch" on a load-bearing step.
   The source's compressed appendix proofs must be unpacked completely.
3. GENERAL THEORY FIRST, EXAMPLE SECOND. State and prove each result at FULL
   GENERALITY first, THEN illustrate with the running example. The example
   illustrates; it never replaces the theorem.
4. PHYSICS-FIRST. Open each chapter with the physical picture / a concrete named
   application before the algebra. Give every result an operational, measurable
   consequence.
5. THE RUNNING EXAMPLE is fixed in EXAMPLE_SPEC below and all its numbers live in
   ${NUMBERS} (the SINGLE SOURCE OF TRUTH). Never invent a number: quote numbers.md
   and cite the script in ${CODE} that produced it.
6. FIGURES are publication-grade and PDF-only. Author them as TikZ where possible;
   data-heavy panels may reuse existing PDFs in ${FIGS}. Palette: ${PALETTE}.
   Bold panel letters, direct annotation of the key quantities.
7. NUMBERS-AS-FIGURES. Every load-bearing quantity in ${NUMBERS} must ALSO appear in
   at least one figure or professionally typeset table in the chapters — a bare
   inline number is NOT acceptable as the only presentation of a key result. The
   referee files blockers for violations (scored under Visualization).
${BIB !== 'off' ? `8. ONE SOURCE OF TRUTH FOR CITATIONS. \\cite ONLY keys that exist in ${CITATIONS}
   (and ${BIBFILE}) — read the ledger before citing. NEVER invent a citation from memory:
   a reference that is not in the verified ledger does not get cited, period. If a source
   you want is missing, leave the statement uncited (the notes are self-contained;
   citations are provenance, not proof) — the ledger's [Gaps] section is where missing
   sources are recorded. Literature POSITIONING lives ONLY in the epilogue's "Context and
   positioning" section — never in the Preface or Section I, and never as novelty-selling
   or citation politics anywhere.` : ''}
NOTATION CONTRACT: follow ${CONTRACT} EXACTLY (macros, theorem environments, label
conventions, what each chapter may assume from earlier chapters). Read it before writing.

${A.correctnessTrap || `
KEY CORRECTNESS TRAP (project-specific — replace for your paper). The adjugate index
convention: [Psi_q]_{ij} = total weight of rooted spanning q-forests in which state i
lies in the tree rooted at j. The charge is omega_i = sum_q (-lambda_1)^{q-1}[Psi_q]_{i j*}
for a fixed reference column j*. A prior version had an i<->j index-swap bug. Get this
EXACTLY right and show it.`}
`

// ---- 4. CONCEPTS that MUST be built from scratch -------------------------
// Listed explicitly so the pedagogy lens can check "used-before-defined" and
// "cited-not-explained".
// REPLACE FOR YOUR PAPER: list YOUR paper's load-bearing machinery.
const CONCEPTS = A.concepts || [
  'nodal domains', 'the discrete Courant / Fiedler theorems', 'the adjugate matrix',
  'the (all-minors) matrix-forest / matrix-tree theorem', 'spectral projectors',
  'the Descartes / Laguerre rule for exponential sums', 'the argument principle / winding number',
  'the saddle-node fold normal form', 'the Courant-Fischer min-max principle',
]
const conceptsList = CONCEPTS.join('; ')

// ---- 4b. POSITIONING SPEC (project-agnostic) -------------------------------
// Injected into the drafting prompt of the ONE chapter flagged positioning:true
// (normally the epilogue) when BIB != 'off'. This is the literature layer's only
// content home: the Preface and Section I stay citation-free by design.
const POSITIONING_SPEC = `
THIS CHAPTER CARRIES THE "CONTEXT AND POSITIONING" SECTION — the single home of
literature positioning in the whole document. Before writing it, read ${CITATIONS}
(especially its [Positioning] and [Expositions] material) and cite ONLY keys that exist
there. The section does BOTH positionings:
 (i)  THE RESULT vs the research literature: what it builds on (the load-bearing prior
      results, each cited), what it sits beside (the nearest/parallel approaches — one or
      two sentences each on how they differ in mechanism, assumptions, or scope), and what
      it adds — the delta stated factually. Every claim ABOUT a paper carries its \\cite.
 (ii) THESE NOTES vs existing treatments: how this document relates to available
      expositions of the same material (reviews, textbooks, tutorials — cited) and what it
      adds at the exposition level (full from-scratch proofs, code-verified numbers, the
      non-degenerate worked example carried throughout).
 PLUS the LITERATURE-MAP FIGURE (archetype L in the skill's figure_techniques.md): a
 three-band TikZ map — FOUNDATIONS (upstream, what the result builds on) at the top, THIS
 WORK beside its PARALLEL approaches in the middle band, DOWNSTREAM / OPEN directions at
 the bottom — every node labeled with its citation key, edges = builds-on / contrasts.
 HOUSE GENES APPLY IN FULL: no novelty-selling tone, no citation politics — state
 relationships plainly; positioning is a map, not marketing. If a positioning claim has no
 verifiable source in ${CITATIONS}, weaken it to what the ledger supports or drop it —
 NEVER cite from memory (the [Gaps] section records what could not be verified).`

// ---- 5. EXAMPLE_SPEC (the linchpin) --------------------------------------
// A self-contained prompt describing the running example and EXACTLY what the
// verifier script must compute and CROSS-CHECK (ideally 3 independent ways, so a
// single bug cannot pass). This is the highest-leverage thing to get right; the
// whole document quotes numbers.md.
// REPLACE FOR YOUR PAPER: replace this spec wholesale (keep the cross-check-3-ways discipline).
const EXAMPLE_SPEC = A.exampleSpec || `
PRIMARY RUNNING EXAMPLE: "two triangles, two rungs" (6 states). Block A={0,1,2} and
block B={3,4,5} are each a triangle (strong internal symmetric prefactor kappa_in~3.0),
joined by EXACTLY TWO weak cross-edges (rungs) (0,3) and (2,5) with weak kappa_cut~0.15,
so the slow cut is a genuine MULTI-EDGE cut (the cycle 0-3-5-2-0 crosses it) — explicitly
NOT a single bridge. Detailed-balance rates w_ij = kappa_ij * exp(-(E_j-E_i)/2), T_b=1.

THE VERIFIER (pure numpy/scipy) must, for a given energy vector E:
 - build the row-Laplacian L, compute the spectrum, the slow eigenvalue lambda_1, and the
   slow right eigenvector r_1 (the charges omega).
 - compute omega THREE INDEPENDENT WAYS and assert agreement to ~1e-9:
     (i)   eigenvector r_1;
     (ii)  the adjugate column omega_i = [adj(-lambda_1 I + L)]_{i,j*}/scale, using the
           documented index convention [Psi_q]_{ij} = forests where i is in the tree rooted at j;
     (iii) brute-force enumeration of rooted spanning forests, summing weights into
           [Psi_q]_{i j*}, then omega_i = sum_q (-lambda_1)^{q-1}[Psi_q]_{i j*}.
 - confirm the sign domains are exactly A vs B and report the cut edges.
 - form Z_omega(beta)=sum_i omega_i e^{-beta E_i}; find all real positive zeros (excluding the
   trivial bath zero), report M (count), V (energy-ordered sign changes of omega), the parity
   check, and the T_M values.

Find and record TWO energy assignments:
 (a) ALIGNED (A low, B high) => expect V=1, M=0.
 (b) FRUSTRATED (interleave energies across the cut) => reach V=3, M=2 (one cold + one hot T_M).
   Search energies (and gently adjust kappas while KEEPING the 2-edge cut and A/B split) until
   M=2 is robust with a well-separated pair. If genuinely unreachable, fall back to the richest
   case but you MUST keep a multi-edge (>=2) cut AND a non-trivial frustrated case (M>=1).

ALSO capture the canonical numbers from the existing scripts into the SAME file:
 - cd "${CODE}" && python verify_core.py    (4-state K_4 by-hand example: omega, lambda_1, T_M)
 - cd "${CODE}" && python verify_gated.py    (covariance identity, interlacing residuals)
 - cd "${CODE}" && python saddle_node.py      (saddle-node family: g_c, beta_c, onset exponent,
                                              index sequence) — read saddle_data.npz if it is slow.

numbers.md SECTIONS (each entry cites its producing script; 4-6 sig figs; reproducible):
 [Primary network] topology, edge list, kappas, the aligned E and frustrated E; for EACH:
   lambda_1, full omega vector, cut edges, energy-ordered sign sequence, V, M, T_M list, parity;
   plus a couple of explicit forest weights / [Psi_q] entries useful for the text.
 [By-hand example] the small network (e.g. 4-state K_4) with enough rooted-forest detail to
   enumerate by hand in the relevant chapter.
 [Saddle-node / topological example] the family, g_c, beta_c, onset exponent, index sequence.
 [Identities] covariance / interlacing residual magnitudes.
`

// ---- 6. CHAPTERS ---------------------------------------------------------
// The per-chapter spec. Each entry:
//   id      stable handle (also the .tex filename and label suffix)
//   num     chapter number
//   title   chapter title
//   core    true if the running example MUST appear here (a hard-gate chapter)
//   synthesis  true for the ONE chapter written LAST by the Synthesis phase
//           (Section I, the opening article); the per-chapter drafting pipeline
//           (Phase C) EXCLUDES it — the scaffold still stubs it and the master
//           still \inputs it.
//   positioning  true for the ONE chapter (normally the epilogue) that carries the
//           "Context and positioning" section + the literature-map figure when the
//           literature layer is on (BIB != 'off'); its drafting prompt gets
//           POSITIONING_SPEC appended. Ignored when BIB = 'off'.
//   source  where the chapter's content comes from (paper line ranges + machinery)
//   covers  a detailed brief of what to derive/prove/illustrate (the meat)
//   figures what figures to author / reuse
// REPLACE FOR YOUR PAPER: swap the whole array; the pipeline length adapts automatically.
const CHAPTERS = A.chapters || [
  // REPLACE FOR YOUR PAPER: the synthesis chapter below is Section I — the PRL-style
  // opening article, written LAST by the Synthesis phase. Keep synthesis:true, num 0,
  // core:false; swap the Mpemba story, chain, and figures for your paper's.
  {
    id: 'ch0', num: 0, core: false, synthesis: true,
    title: 'The Mpemba effect as topological frustration: the whole story',
    source: `Written LAST, in the Synthesis phase, from the FINISHED chapters in ${OUT}/chapters/
(it summarizes the completed book — facts, not plans — so the paper is only background here).`,
    covers: `Section I: a PRL-style STANDALONE ARTICLE that replaces a conventional prologue and
tells the whole story of the notes. The FIRST paragraph answers why it matters (anomalously fast
relaxation — the Mpemba effect — and why "the condition is a statement about eigenvectors" is
unsatisfying); physics-first storytelling and "what is the physics behind this" carried through.
EVERY major theorem of the notes appears as a FORMAL STATEMENT (precise assumptions +
conclusion, in a real theorem environment, NO proof, no mechanism footnote) embedded at the
story's load-bearing points, forming a COMPLETE LOGICAL CHAIN — what implies what, via which
assumption, visible at a glance. For Mpemba the chain is the three topological layers:
generalized Fiedler / nodal-domain theory fixes ONE slow (in general multi-edge) cut -> the
matrix-forest dictionary makes the charges omega combinatorial -> frustrated cut-energy
interleavings create and count the real zeros of Z_omega (Descartes M<=V-1, parity) -> the
winding number protects the count (selection rules, saddle-node folds) -> dark modules localize
the index into design rules. Objects pay only a WORKING-DEFINITION tax: 1-2 lines, precise
enough to parse the formal statements, plus a pointer to the rigorous definition's chapter.
Proofs, proof-sketch levers, and NUMBERS stay in the body chapters. SUCCESS TEST (the D-test): a
reader of this chapter ALONE can say "I believe / don't believe the paper's central claim,
because ..." — judgment powered by the logical chain. Guidance devices (both required): the
theorem-dependency DAG (nodes tagged with the chapter/section numbers where the proofs live) and
reader-type READING ROUTES (e.g. user / verifier / teacher paths). FORBIDDEN GENES (from PRL —
never reproduce): novelty-selling tone ("first ever", breakthrough talk), citation politics,
compression pain ("it can be shown"). Length: 8-12 pages, one-sitting readable, scaled to
content.`,
    figures: 'TikZ: the theorem-dependency DAG (nodes tagged with chapter/section numbers); one no-numbers story schematic of the three-layer logic.',
  },
  {
    id: 'ch1', num: 1, core: false,
    title: 'Setup: reversible Markov networks and the slow mode',
    source: `Paper ${PAPER} (~145-170); machinery: ${sourcesList}.`,
    covers: `Build the toolbox from scratch: continuous-time Markov chain, row-Laplacian L,
master equation, detailed balance, the Arrhenius parametrization, the spectrum, biorthonormal
eigenvectors, the spectral relaxation expansion and overlaps a_alpha(T). Define the slow mode
and the charges omega. Introduce the running-example NETWORK (topology only) from numbers.md.`,
    figures: 'TikZ: the primary network (topology, before charges).',
  },
  {
    id: 'ch2', num: 2, core: true,
    title: 'One slow cut: Fiedler and nodal-domain theory',
    source: `Paper ${PAPER} Sec II + App A (Thm 1).`,
    covers: `The generalized Fiedler theorem, fully. Build the similarity to a symmetric
S=D^{1/2} L D^{-1/2}; explain nodal domains from scratch; prove omega takes both signs, the
discrete Courant bound (at most two strong nodal domains), Fiedler connectivity (each sign
component connected). Define the slow CUT; EMPHASIZE it is in general a MULTI-EDGE cut (single
edge only on a tree — state the tree corollary). Include a complete (not "sketch") proof of the
Courant-Fischer min-max principle. Work the primary example from numbers.md: S, the slow
eigenvector, exactly two nodal domains, the 2-edge cut.`,
    figures: 'TikZ: primary network colored by sign(omega), sized by |omega|, the multi-edge cut dashed, the two sign-domain hulls.',
  },
  {
    id: 'ch3', num: 3, core: true,
    title: 'The forest charges: a matrix-tree dictionary',
    source: `Paper ${PAPER} Sec IV + App B; machinery: ${sourcesList}.`,
    covers: `Build the forest-spectral dictionary FROM SCRATCH so the charges need no
eigenvectors. Define rooted spanning trees/forests, forest weight, Phi_q, the refined
[Psi_q]_{ij}; the adjugate N(s)=adj(sI+L). State the characteristic-polynomial and ALL-MINORS
matrix-forest theorems with the index convention spelled out (full proof in an appendix,
forward-referenced). Derive the charge formula omega_i = sum_q (-lambda_1)^{q-1}[Psi_q]_{i j*}.
HANDLE THE INDEX-SWAP TRAP EXPLICITLY. Then the small by-hand example from numbers.md: ENUMERATE
rooted spanning forests BY HAND and show agreement with the eigenvector route to machine
precision.`,
    figures: 'TikZ: a gallery of rooted spanning forests with weights, summing into [Psi_q] entries.',
  },
  {
    id: 'ch4', num: 4, core: true,
    title: 'Frustration and the forest partition function',
    source: `Paper ${PAPER} Sec III + Sec IV + App A proofs.`,
    covers: `The core counting result. Derive a_1(T)=Z_omega(1/T)/Z(T) with the signed forest
partition function; explain why signed charges make real zeros possible. Define cut-energy
interleavings V. Derive the COVARIANCE IDENTITY and the Rolle interlacing; prove the ALIGNED-CUT
no-go (M=0), the Sturm no-go for monotone chains, the DESCARTES rule for exponential sums (full
induction) and M<=V-1, and the PARITY rule. Then the primary example from numbers.md in BOTH
assignments: aligned (V=1, M=0) and frustrated (V=3, M=2) — every intermediate number shown.
This is THE operational walkthrough.`,
    figures: 'TikZ: the two-orderings/frustration diagram; the energy-ordered sign sequence (aligned vs frustrated); the Z_omega(beta) curve with bath zero + Mpemba zeros marked.',
  },
  {
    id: 'ch5', num: 5, core: true,
    title: 'Protection: the Mpemba index is a winding number',
    source: `Paper ${PAPER} Sec V + App A; data ${CODE}/saddle_node.py.`,
    covers: `Topological protection. Introduce the complex (Fisher) zeros of the entire function
Z_omega. Explain the ARGUMENT PRINCIPLE from scratch and derive M+1 = (1/2pi i) oint Z'/Z dbeta.
Prove the truncation bound that justifies the contour; prove the SELECTION RULE (DeltaM=+-1 at
boundary crossings, +-2 at an interior saddle-node where a conjugate pair collides on the axis).
Derive the FOLD NORMAL FORM and the square-root onset. Stress it is a finite-network Fisher-zero
pinch, not a thermodynamic transition. Work the saddle-node family from numbers.md (index walk,
g_c, fitted onset exponent ~0.5).`,
    figures: 'TikZ: the complex-beta winding plane (real + complex zeros, contour, allowed events); the index staircase vs the coupling.',
  },
  {
    id: 'ch6', num: 6, core: true,
    title: 'Locality, dark modules, and design rules',
    source: `Paper ${PAPER} Sec VI + App C.`,
    covers: `Where does the index live? Articulation vertices and forest-weight factorization.
Prove the dark-module proposition (a fast block glued at a single articulation vertex enters
Z_omega only through its total Boltzmann weight). THE GENERALIZATION (do explicitly): what
survives when the block attaches by MORE THAN ONE EDGE — quantify how the within-block charge
spread and the reduction residual scale with the extra coupling and the spectral-gap ratio,
using the primary 2-edge-attachment network as testbed (request a numeric check be added to
numbers.md if needed). State the design rules as an OPERATIONAL recipe, each tied to the theorem
that licenses it, and connect to experiment.`,
    figures: 'TikZ: single-articulation dark block vs multi-edge attachment, charge structure migrating to the slow block.',
  },
  {
    id: 'ch7', num: 7, core: false, positioning: true,
    title: 'Epilogue: context, positioning, and outlook',
    source: `Paper ${PAPER} Sec VII; the [Positioning] section of the citations ledger.`,
    covers: `Recap the topology hierarchy in one view. Then the "Context and positioning"
section (see POSITIONING_SPEC, appended automatically): the result against the Mpemba /
spectral-relaxation literature it builds on, beside the parallel mechanism proposals, and
what it adds; these notes against existing expositions; the literature-map figure. Close
with open directions. Short and inspiring.`,
    figures: 'TikZ: the literature-map / positioning diagram (archetype L), nodes keyed to refs.bib.',
  },
]
const chTitles = CHAPTERS.map(c => `${c.num}=${c.title}`).join('; ')
const coreIds  = CHAPTERS.filter(c => c.core).map(c => c.id)
const POSCH    = CHAPTERS.find(c => c.positioning)   // the Context & positioning chapter (if any)

// ---- 7. RUBRIC (acceptance gate) -----------------------------------------
// The referee scores against this; the HARD GATES below must ALL pass regardless
// of the numeric score. Tune the dimensions/weights for your paper, but keep the
// hard gates that encode the user's non-negotiables.
// THRESHOLD: the numeric acceptance bar (see acceptance_rubric.md: accepted =
// score >= THRESHOLD AND all hard gates green). Overridable via args.threshold.
const THRESHOLD = Number.isFinite(A.threshold) ? A.threshold : 90
// REPLACE FOR YOUR PAPER: the gate-6 structural-invariant wording in HARD GATES below ("a MULTI-EDGE cut, not a single bridge" is Mpemba-specific).
const RUBRIC = (A.rubric || `
ACCEPTANCE RUBRIC (100 pts). Hard gates must ALL pass regardless of score.
1 Self-containedness (15): nothing used before defined; the target reader can follow; Section I
  (the opening article) alone lets a reader judge the paper's central claim via a complete chain
  of formally stated results; the Preface alone (the compression telescope's first layer) lets a
  reader RETELL the result to an outsider AND EXPLAIN THE MECHANISM — why it holds, what competes
  with what, where the tension resolves.
2 Concept depth (15): each named object built from scratch with intuition + a small check.
3 Theorem expansion (15): every theorem/lemma -> assumptions, intuition, gap-free proof,
  with WHERE each assumption is used.
4 Worked example & operationality (20, highest): the running example carried through EVERY
  intermediate number in the core chapters; a reader can replicate on a NEW network.
5 Correctness (15): all numbers match numbers.md; conventions right; zero unresolved flags;
  every \\cite resolves to a verified citations.md entry — a fabricated or unresolvable
  reference is a blocker.
6 Visualization (10): all figures present, render, visually checked, publication-grade;
  every load-bearing numbers.md quantity ALSO appears in at least one figure or
  professionally typeset table (a bare inline number is never its only presentation).
7 Pedagogical flow / physics-first (5): picture+application first; general before example;
  one coherent arc; Section I reads as a PRL-style story (physics first, no proofs, no selling),
  with dependency DAG and reading routes; the Preface is physical-picture-first, zero-formula
  prose, a strict compression of Section I, at most 2 typeset pages; when the notes cite, the
  epilogue carries the "Context and positioning" section (result vs literature + notes vs
  existing expositions + the keyed literature-map figure; no selling, no citation politics) —
  the ONLY home of positioning (Preface and Section I stay citation-free).
8 Build & reproducibility (5): pdflatex x3 clean; numbers traceable to scripts.
HARD GATES: compiles clean; zero ground-truth mismatches (every number matches numbers.md AND,
wherever the notes cite, every \\cite resolves to a verified citations.md entry — fabricated
references are a gate failure); zero unexplained load-bearing concepts; every theorem has a
full proof; running example present in every core chapter; the primary example's defining
structural property holds (here: a MULTI-EDGE cut, not a single bridge).
`) + `
ACCEPTANCE: total score >= ${THRESHOLD}/100 AND all hard gates green AND zero blockers.`

/* ===========================================================================
 * =========================  CONFIG END  ====================================
 * ===========================================================================
 * From here down is the project-agnostic pipeline. You normally don't edit it.
 * ------------------------------------------------------------------------- */

// ---- fail fast on an unadapted CONFIG -------------------------------------
// The PATHS defaults above are placeholders. Refuse to launch dozens of
// expensive agents against them: abort loudly BEFORE any agent is spawned.
// (The sandbox forbids fs, so this string check is the strongest possible guard.)
const unconfigured = [PAPER, OUT, CODE, FIGS, ...SOURCES]
  .filter(p => typeof p !== 'string' || p.includes('/ABSOLUTE/PATH/'))
if (unconfigured.length) {
  log('FATAL: CONFIG paths not set: ' + unconfigured.join(', ')
    + ' — edit the CONFIG block or pass args {paper, out, code, figs, sources}.')
  return { error: 'unconfigured-paths', unconfigured }
}

// ---- shared JSON schemas (kept identical to the real run) ----------------

// A reviewer lens returns a summary + a list of structured findings.
const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          kind: { type: 'string', enum: ['math', 'numeric', 'pedagogy', 'build', 'style'] },
          location: { type: 'string' },          // file + where (section/eq/line)
          problem: { type: 'string' },
          fix: { type: 'string' },                // concrete, actionable
        },
        required: ['severity', 'kind', 'location', 'problem', 'fix'],
      },
    },
  },
  required: ['summary', 'findings'],
}

// The typeset agent reports which preamble it used and whether the design landed.
const TYPESET_SCHEMA = {
  type: 'object',
  properties: {
    source: { type: 'string', enum: ['shipped', 'authored'] }, // shipped = SKILLREF preamble
    sandboxCompiles: { type: 'boolean' },
    liveApplied: { type: 'boolean' },   // professional preamble live AND 3-pass build clean
    pagesChecked: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['source', 'sandboxCompiles', 'liveApplied', 'notes'],
}

// A fixer reports how much it applied and whether the file still compiles.
const FIX_SCHEMA = {
  type: 'object',
  properties: {
    applied: { type: 'number' },
    compiles: { type: 'boolean' },
    residual: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['applied', 'compiles', 'residual', 'notes'],
}

// The referee returns dimension scores + the hard-gate booleans + blockers.
const SCORE_SCHEMA = {
  type: 'object',
  properties: {
    total: { type: 'number' },
    dimensions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          score: { type: 'number' },
          max: { type: 'number' },
          notes: { type: 'string' },
        },
        required: ['name', 'score', 'max', 'notes'],
      },
    },
    hardGates: {
      type: 'object',
      properties: {
        compiles: { type: 'boolean' },
        // numbersMatch is the WIDENED G2 (v2.5): numbers vs numbers.md AND, wherever the
        // notes cite, every \cite resolving to a verified citations.md entry.
        numbersMatch: { type: 'boolean' },
        conceptsExplained: { type: 'boolean' },
        proofsComplete: { type: 'boolean' },
        exampleInCoreChapters: { type: 'boolean' },
        structuralInvariant: { type: 'boolean' }, // e.g. multi-edge cut (not a single bridge)
      },
      required: ['compiles', 'numbersMatch', 'conceptsExplained', 'proofsComplete', 'exampleInCoreChapters', 'structuralInvariant'],
    },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['total', 'dimensions', 'hardGates', 'blockers'],
}

// Small helper: render a findings list into a prompt-ready bullet block.
const renderFindings = (findings, cap = 60) =>
  (findings || []).slice(0, cap)
    .map(f => `- (${f.severity}/${f.kind}) [${f.location}] ${f.problem}  => FIX: ${f.fix}`)
    .join('\n') || '(no findings)'

const allGatesPass = (g) =>
  !!(g && g.compiles && g.numbersMatch && g.conceptsExplained &&
     g.proofsComplete && g.exampleInCoreChapters && g.structuralInvariant)

// =================================================================== PHASE A: scaffold
phase('Scaffold')
log('Phase A: preamble, master file, build scripts, and the notation contract.')

await agent(`You are setting up a LaTeX lecture-notes project. Create the directory and
scaffolding under ${OUT} (create it). Quote any path containing [ ] in double quotes in bash.

STEP 0 — OUT FRESHNESS GATE (do this before creating ANYTHING). ${OUT} must be a fresh,
dedicated build directory: the build writes AND CLEANS here, so it must never share a
folder with pre-existing work. If ${OUT} already exists and is non-empty and does NOT
contain a previous build's markers (job_card.md / BUILD_STATE.md / preamble.tex):
  (a) STOP and report the refusal with a listing of what is already there — recommend the
      operator point OUT at a fresh subdirectory instead. Do NOT scaffold, unless the
      operator explicitly pre-authorized building into a non-empty directory;
  (b) if pre-authorized, your VERY FIRST action — before creating a single file — is the
      protective snapshot:  cd "${OUT}" && find . -type f | sed 's|^\./||' | sort > .preexisting_manifest
      clean.sh treats every path in that manifest as untouchable.
Resolve pdflatex PROBE-STYLE, and make the build scripts below do the same: use
"command -v pdflatex" if it is on PATH; else ${TEXBIN}/pdflatex; else
/Library/TeX/texbin/pdflatex (macOS MacTeX); else the glob
/usr/local/texlive/*/bin/*/pdflatex (Linux TeX Live). pdftoppm (used later for page
renders) ships with poppler (poppler-utils on Linux).
${SKILLREF ? `
TEMPLATES: the skill package at ${SKILLREF} ships compile-tested scaffold templates in
${SKILLREF}/references/scaffold/ — master.tex, compile_one.sh, build_all.sh,
contract_template.md, check_figure.sh, clean.sh. ADAPT those (fill in title, author, the chapter
list, and the project paths) instead of regenerating the corresponding deliverables from
the prose specs below; the prose specs then serve as your acceptance criteria. Copy
check_figure.sh and clean.sh into ${OUT} as-is (figure checks; end-of-build housekeeping).
` : ''}
${STANDARDS}

DELIVERABLES:
1. ${OUT}/preamble.tex — a robust 'report'-class preamble. Use amsmath, amssymb, amsthm,
   mathtools, graphicx, xcolor, hyperref, booktabs, colortbl, enumitem, tcolorbox, and tikz with the
   libraries you need (arrows.meta, calc, positioning, decorations.pathmorphing, backgrounds,
   fit, patterns, shapes.geometric, plotmarks). Define theorem environments (theorem,
   proposition, lemma, corollary, definition, example, remark) numbered by chapter. Define the
   color palette: ${PALETTE}. Mirror the source paper's macros (read its preamble in ${PAPER})
   and add any the notes need. Provide a boxed-result tcolorbox ("keyresult"). It must compile.
   NOTE: this plain preamble is stage one of a deliberate two-stage design. Keep the environment
   names above and every macro name EXACTLY as specified: after content is finished, the
   professional layer (the skill's references/preamble_lecture_notes.tex, applied per
   references/typesetting_guide.md) is swapped in with ZERO chapter edits. Do not invent a
   different design, and keep the color NAMES exactly as in the palette you define — the later
   upgrade must preserve every name you introduce.
2. ${MASTER} — the MASTER file: documentclass report, \\input{preamble}, title "${TITLE}",
   author "${AUTHOR}", \\tableofcontents, then one \\input{chapters/<id>} per chapter, then
   \\input{chapters/appendices}. Create EMPTY placeholder files chapters/<id>.tex and
   chapters/appendices.tex (each a \\chapter{...} stub) so the master compiles NOW. Chapter
   titles: ${chTitles}.
3. ${OUT}/compile_one.sh — takes one chapter file path; wraps it as a standalone document around
   ${OUT}/preamble.tex in a temp file whose name is UNIQUE PER INVOCATION (e.g. derived from the
   chapter file's basename, or mktemp), so that concurrent invocations on different chapters
   never share the wrapper .tex or its aux/log/pdf files — the drafting pipeline runs
   compile_one.sh on several chapters at once. If the wrapper compiles outside ${OUT}, \\input
   the preamble by ABSOLUTE path (${OUT}/preamble.tex). Resolves pdflatex probe-style as above;
   runs ONE fast pdflatex -interaction=nonstopmode pass (in-chapter cross-refs may print as ??;
   the full build settles them); prints PASS/FAIL and the last error lines.
   (Used by drafting agents to self-check a single chapter.)
4. ${OUT}/build_all.sh — resolves pdflatex probe-style as above; runs pdflatex
   -interaction=nonstopmode on the master THREE times (TOC + refs settle); reports PASS/FAIL with
   error context and the final page count.
5. ${CONTRACT} — the NOTATION & STYLE CONTRACT every drafting agent must follow: the exact macro
   list; theorem-environment usage; the label convention (\\label{ch:..}, thm:.., eq:.., fig:..);
   any global sign/normalization convention; the rule "general theorem first, example after"; the
   figure palette & style; and a per-chapter table (id, title, what it proves, what it may ASSUME
   already proved earlier; mark the [core] chapters — the running example MUST appear in each).
   Derive that table from:
   ${CHAPTERS.map(c => c.id + (c.core ? ' [core]' : '') + ': ' + c.title).join(' | ')}.

Run build_all.sh at the end and confirm the stub document compiles cleanly. Return: files
created, compile status, page count.`,
  { label: 'scaffold', phase: 'Scaffold', effort: 'high' })

// =================================================================== PHASE B: ground truths (example numbers ∥ literature)
phase('Example')
log('Phase B: numeric ground truth (numbers.md)'
  + (BIB !== 'off' ? ' with the Literature phase (citations ledger) in parallel.' : '.'))

// ---- Phase B thunk: example + ground-truth numbers (B1 -> B2 -> B3) -------
const runExample = async () => {

// B1: design the example and produce numbers.md from RUNNABLE code.
const exDesign = await agent(`You are designing the PRIMARY running example for the lecture notes
and producing the SINGLE SOURCE-OF-TRUTH numbers file ${NUMBERS}. This is the linchpin: every
chapter quotes your numbers.

${STANDARDS}

TASK. Write a verifier script under ${OUT} (pure numpy/scipy) that builds and FULLY analyzes the
running example and finds the parameter assignments required below. Run it, iterate until all
internal cross-checks agree, then write ${NUMBERS}.

EXAMPLE & VERIFIER SPEC:
${EXAMPLE_SPEC}

Every numbers.md entry must cite the script that produced it; round to 4-6 sig figs; note that
the numbers are reproducible. Return a concise summary of the final example parameters and the
headline numbers.`,
  { label: 'example-design', phase: 'Example', effort: 'high' })

// B2: an INDEPENDENT auditor re-derives the numbers from scratch.
const exCheck = await agent(`Independently AUDIT the running-example numbers. Read ${NUMBERS} and
the verifier script under ${OUT}. Re-derive the headline case FROM SCRATCH with your own short
numpy script (build the model from the stated parameters, diagonalize, recompute the key
quantities, find the relevant zeros) and confirm they match numbers.md. Spot-check one
combinatorial/structural quantity by an independent brute-force count. Report any discrepancy
precisely (expected vs found). Severity calibration: any confirmed numeric discrepancy, failed
cross-check, or violated structural requirement is severity=blocker. If everything matches, say
so explicitly.`,
  { label: 'example-audit', phase: 'Example', schema: FINDINGS_SCHEMA, effort: 'high' })

log('Example audit: ' + (exCheck ? exCheck.summary : 'n/a'))

// B3: if the audit found blockers or majors, repair numbers.md BEFORE any drafting.
// (Belt-and-suspenders: majors are included because numbers.md is the single
// source of truth — a confirmed mismatch must never reach the drafting agents.)
const exBlockers = ((exCheck && exCheck.findings) || [])
  .filter(f => f.severity === 'blocker' || f.severity === 'major')
if (exBlockers.length) {
  log('Repairing ' + exBlockers.length + ' blocker/major example-numbers issue(s) before drafting.')
  await agent(`The running-example numbers have serious issues found by an audit. Fix the
verifier script and ${NUMBERS} so all cross-checks agree and the required cases are correct and
self-consistent. Findings:
${exBlockers.map(f => '- [' + f.location + '] ' + f.problem + ' => ' + f.fix).join('\n')}
Re-run, verify, rewrite numbers.md. Return what changed and the corrected headline numbers.`,
    { label: 'example-repair', phase: 'Example', effort: 'high' })
}

return exDesign
}

// ---- Phase B2 thunk: literature ground truth (L1 -> L2 -> L3) --------------
// The literature analogue of Phase B: citations.md + refs.bib are built and
// independently audited BEFORE any drafting, so chapters only ever cite verified
// keys. Skipped entirely when BIB = 'off'.
const runLiterature = async () => {
  if (BIB === 'off') return null

  // L1: build the ledger (inherit and/or discover), verify every entry by lookup.
  const litBuild = await agent(`You are building the CITATIONS GROUND TRUTH for the lecture
notes: ${BIBFILE} (BibTeX) and ${CITATIONS} (the annotated ledger). This is the literature
analogue of numbers.md: NO \\cite may appear in the notes that does not resolve to a verified
entry here, and NO entry may enter without a resolved identifier. A citation produced from
model memory without verification is exactly the failure mode this file exists to prevent
(fabricated references).

MODE: ${BIB}.
 - inherit  : build the ledger ONLY from the source's own bibliography.
 - discover : inherit whatever exists, THEN fill the load-bearing gaps by search.
 - auto     : inspect the source; if it carries a usable bibliography (\\bibliography line,
   a .bib/.bbl next to it, or embedded \\bibitem entries), behave as inherit; else as
   discover. Record the RESOLVED mode in the ledger header.

STEP 1 — INHERIT. Read ${PAPER} (and the machinery sources: ${sourcesList}); collect its
\\cite keys and its bibliography (.bib/.bbl next to the source, or embedded \\bibitem
entries). Carry over the entries the notes will actually lean on (the load-bearing subset,
not necessarily all).
STEP 2 — DISCOVER (discover mode, or auto resolved to discover). Derive search targets from
(a) the load-bearing CONCEPTS (${conceptsList}) — the original/canonical source and one good
modern treatment each, where they exist; (b) the paper's central claims — the nearest prior
and parallel works needed to POSITION the result; (c) existing expositions (reviews,
textbooks, tutorials) of the same material, for the notes-vs-expositions paragraph. Search
with the network tools available to you; the keyless APIs work everywhere:
arXiv Atom API (http://export.arxiv.org/api/query), Crossref (https://api.crossref.org/works),
OpenAlex (https://api.openalex.org/works). If installed literature/citation skills are
available in your environment, you may use those instead.
STEP 3 — VERIFY EVERY ENTRY (all modes, inherited entries included). Resolve each entry's
identifier by an ACTUAL lookup: the DOI resolves (e.g. curl -sIL a doi.org URL), or the
arXiv ID exists (API query), or a stable URL responds — that is tier T1; then confirm
title/authors/year match the BibTeX — tier T2. Tag every entry with the tier reached.${MODE === 'full' ? `
For the POSITIONING-CRITICAL entries (the ones the Context section will lean on), also do a
T3 claim-support check: read the abstract (and the relevant section where accessible) and
confirm the work actually supports the one-line role you assign it.` : ''}
STEP 4 — WRITE ${CITATIONS} with sections:
 [Header]      the resolved mode and the search targets used.
 [Entries]     one line per key: BibTeX key | identifier (DOI/arXiv/URL) | tier reached |
               one-line role (what this work establishes FOR THESE NOTES) | where the notes
               should use it.
 [Positioning] the epilogue Context-section inputs, every item keyed: UPSTREAM (works the
               result builds on, and which prior result each supplies); PARALLEL (nearest /
               competing approaches, one line each on how they differ in mechanism,
               assumptions, or scope); DOWNSTREAM/OPEN (what the result enables or leaves
               open); EXPOSITIONS (existing treatments of the same material, for the
               notes-vs-expositions paragraph).
 [Gaps]        wanted-but-unverifiable sources: claims or concepts for which no verifiable
               reference was found. Record them explicitly — the notes stay UNCITED at those
               points; gaps are visible, never papered over.
STEP 5 — WRITE ${BIBFILE}: exactly one clean BibTeX entry per ledger key (stable descriptive
keys, no duplicates). Do NOT wire the master's \\bibliography hook — the Assemble phase does
that once chapters actually cite.
NETWORK FALLBACK: if you genuinely have no network access, fall back to inherit-only from
the local files and record every discovery target under [Gaps] — NEVER fill a gap from
memory.
Return: the resolved mode, entry counts by tier, a 2-3 line positioning headline, and the
gap count.`,
    { label: 'literature-build', phase: 'Literature', effort: 'high' })

  // L2: an INDEPENDENT auditor re-resolves every identifier with fresh lookups.
  const litCheck = await agent(`Independently AUDIT the citations ground truth. Read
${CITATIONS} and ${BIBFILE}. With your OWN fresh lookups (doi.org, the arXiv API, Crossref,
OpenAlex), re-resolve EVERY entry's identifier and re-check its metadata (title / authors /
year) against the BibTeX. Cross-check ledger <-> bib: identical key sets, no orphans either
way, no duplicate keys.${MODE === 'full' ? ` Spot-check the [Positioning] section at T3: for each
positioning-critical entry, read the abstract and judge whether the work actually supports
its assigned role.` : ''} Severity calibration: a fabricated or unresolvable reference, a
metadata mismatch, a ledger<->bib key mismatch, or a positioning role its source cannot
support is severity=blocker. If everything verifies, say so explicitly.`,
    { label: 'literature-audit', phase: 'Literature', schema: FINDINGS_SCHEMA })

  log('Literature audit: ' + (litCheck ? litCheck.summary : 'n/a'))

  // L3: repair the ledger BEFORE drafting if the audit found blockers/majors.
  const litBlockers = ((litCheck && litCheck.findings) || [])
    .filter(f => f.severity === 'blocker' || f.severity === 'major')
  if (litBlockers.length) {
    log('Repairing ' + litBlockers.length + ' blocker/major citation-ledger issue(s) before drafting.')
    await agent(`The citations ground truth has serious issues found by an audit. Fix
${CITATIONS} and ${BIBFILE} so every entry's identifier resolves, metadata matches, ledger
and bib key sets agree, and every positioning role is supported (move anything unverifiable
to [Gaps] — never keep an unverified entry). Findings:
${litBlockers.map(f => '- [' + f.location + '] ' + f.problem + ' => ' + f.fix).join('\n')}
Re-verify by fresh lookups after fixing. Return what changed and the corrected entry counts.`,
      { label: 'literature-repair', phase: 'Literature' })
  }
  return litBuild
}

// Both ground truths are prerequisites of drafting; they are independent of each
// other, so they run concurrently (each agent carries its own phase label).
const [exDesign] = await parallel([runExample, runLiterature])

// =================================================================== PHASE C: draft -> verify(3 lenses) -> fix, PIPELINED per chapter
phase('Draft')
// The chapter marked synthesis:true (Section I) is EXCLUDED here: it summarizes the
// FINISHED book, so the Synthesis phase (after Assemble) writes it. The scaffold
// still stubbed its file and the master still \inputs it, so the build stays green.
const DRAFT_CHAPTERS = CHAPTERS.filter(c => !c.synthesis)
log('Phase C: drafting ' + DRAFT_CHAPTERS.length + ' chapters (the synthesis chapter is written'
  + ' later, in the Synthesis phase); each is adversarially verified ('
  + (MODE === 'light' ? 'one combined light-mode lens' : 'math/numeric/pedagogy in parallel')
  + ') and fixed as it completes.')

// pipeline() overlaps stages across chapters: while ch_k is being verified, ch_{k+1}
// is already being drafted. Each stage receives the previous stage's result plus the
// original CHAPTER spec and its index.
const chapterResults = await pipeline(
  DRAFT_CHAPTERS,

  // STAGE 1 — draft the chapter and self-compile it.
  (ch) => agent(`Write Chapter ${ch.num} — "${ch.title}" — of the lecture notes into
${chFile(ch.id)} (overwrite the stub; begin with \\chapter{${ch.title}}\\label{ch:${ch.id}}).

${STANDARDS}

BEFORE WRITING: read ${CONTRACT} (notation/labels/what you may assume), ${NUMBERS} (all numbers),
and the SOURCES for this chapter: ${ch.source}. Skim adjacent machinery as needed: ${sourcesList}.

WHAT THIS CHAPTER MUST COVER:
${ch.covers}
${ch.core ? `
THIS IS A CORE CHAPTER: the primary running example, with its ACTUAL values quoted from
${NUMBERS}, MUST appear here — the referee enforces this as a hard gate (exampleInCoreChapters).
` : ''}${ch.positioning && BIB !== 'off' ? POSITIONING_SPEC + '\n' : ''}
CONCEPTS that must be BUILT FROM SCRATCH if used here (never merely cited): ${conceptsList}.

FIGURES: ${ch.figures}
Author TikZ inline (publication-grade, palette ${PALETTE}, bold panel letters, direct annotation).
For reused panels, \\includegraphics a PDF from ${FIGS} (copy needed PDFs into ${OUT}/figs/ and use
the path figs/<name>.pdf). Every figure gets a \\label and an informative caption.

STYLE: LECTURE NOTES, not a paper — generous prose, intuition before formalism, every symbol
defined at first use, FULL proofs in the main text (not deferred), worked-example steps shown with
the ACTUAL numbers from numbers.md. General theorem first, example after.

SELF-CHECK before finishing: run  bash "${OUT}/compile_one.sh" "${chFile(ch.id)}"  and fix every
LaTeX error until it reports PASS. Do not finish on a FAIL.

Return: a summary of what you wrote, the theorems/figures with their labels, the numbers you
quoted (and from which numbers.md section), and the compile status.`,
    { label: 'draft:' + ch.id, phase: 'Draft', effort: 'high' }),

  // STAGE 2 — adversarial verification.
  // Full mode: three lenses IN PARALLEL (math / numeric / pedagogy).
  // Light mode: ONE combined lens carrying all three briefs in a single prompt.
  (draftSummary, ch) => (MODE === 'light'
    ? agent(`COMBINED ADVERSARIAL REVIEW (math + numeric + pedagogy in one pass) of Chapter
${ch.num} (${ch.title}) at ${chFile(ch.id)}. Read it and the sources ${ch.source}.
(a) MATH: check EVERY derivation and proof step for correctness and completeness — assumptions
stated and actually USED; no logical gaps, hand-waves, or "it can be shown"/"standard"/"sketch"
on load-bearing steps; the project's key conventions exactly right (see the correctness trap in
the standards). A plausible-looking step that is not actually justified IS a finding.
(b) NUMERIC: extract every numeric value, vector, and example claim and check it VERBATIM against
${NUMBERS}; re-run the relevant script in ${CODE} or the verifier under ${OUT} where useful; flag
any mismatch, untraceable quantity, wrong sign, or inconsistent intermediate — expected vs found.${BIB !== 'off' ? `
Also check every \\cite key against ${CITATIONS} and ${BIBFILE}: an unknown, memory-invented, or
ledger-missing citation key is a blocker finding.` : ''}
(c) PEDAGOGY: read as ${AUDIENCE}; flag any concept USED BEFORE DEFINED, any object merely CITED
rather than explained (each of these must be built up: ${conceptsList}), missing intuition before
algebra, missing physical motivation, the general theorem not stated before the example, any
place a student would get stuck. Give a concrete fix for each finding.

${STANDARDS}`,
        { label: 'verify:' + ch.id + ':all', phase: 'Verify', schema: FINDINGS_SCHEMA, effort: 'high' })
        .then(lens => ({ ch, findings: (lens && lens.findings) || [] }))
    : parallel([
    // math lens (heavy reasoning)
    () => agent(`ADVERSARIAL MATH REVIEW of Chapter ${ch.num} (${ch.title}) at ${chFile(ch.id)}.
Read it and the sources ${ch.source}. Check EVERY derivation and proof step for correctness and
completeness: are all assumptions stated and actually USED? are there logical gaps, hand-waves,
or "it can be shown"/"standard"/"sketch" on load-bearing steps? Are the project's key conventions
exactly right (see the correctness trap in the standards)? Default to skepticism: a
plausible-looking step that is not actually justified IS a finding. Give a concrete fix for each.

${STANDARDS}`,
      { label: 'verify:' + ch.id + ':math', phase: 'Verify', schema: FINDINGS_SCHEMA, effort: 'high' }),

    // numeric / reproducibility lens (cheaper; can re-run scripts)
    () => agent(`NUMERIC / REPRODUCIBILITY REVIEW of Chapter ${ch.num} (${ch.title}) at
${chFile(ch.id)}. Extract every numeric value, vector, and example claim and check it VERBATIM
against ${NUMBERS}. Where useful, re-run the relevant script in ${CODE} or the verifier under
${OUT} to confirm. Flag any number that does not match numbers.md, any quantity with no traceable
source, any wrong sign, any inconsistent intermediate value. Be exact: expected vs found.${BIB !== 'off' ? `
Also check every \\cite key in the chapter against ${CITATIONS} and ${BIBFILE}: an unknown,
memory-invented, or ledger-missing citation key is a blocker finding.` : ''}`,
      { label: 'verify:' + ch.id + ':num', phase: 'Verify', schema: FINDINGS_SCHEMA }),

    // pedagogy / self-containedness lens (cheaper)
    () => agent(`PEDAGOGY / SELF-CONTAINEDNESS REVIEW of Chapter ${ch.num} (${ch.title}) at
${chFile(ch.id)}. Read as ${AUDIENCE}. Flag: any concept USED BEFORE IT IS DEFINED; any object
merely CITED rather than explained (each of these must be built up: ${conceptsList}); missing
intuition before algebra; missing physical motivation/application; the general theorem not stated
before the example; any place a student would get stuck. Concrete fixes.`,
      { label: 'verify:' + ch.id + ':ped', phase: 'Verify', schema: FINDINGS_SCHEMA }),
  ]).then(lenses => ({ ch, findings: lenses.filter(Boolean).flatMap(l => l.findings || []) }))),

  // STAGE 3 — apply the fixes and recompile the chapter.
  (vr, ch) => agent(`Apply fixes to Chapter ${ch.num} (${ch.title}) at ${chFile(ch.id)}. An
adversarial review produced these findings (blockers and majors FIRST; use judgment on
minors/style):
${renderFindings(vr.findings)}

${STANDARDS}

Edit the chapter to resolve every blocker and major (add missing explanations/proof steps, correct
numbers against ${NUMBERS}, fix any flagged convention error, add intuition/motivation). Keep the
general-first / example-after structure. Then re-run  bash "${OUT}/compile_one.sh"
"${chFile(ch.id)}"  until PASS. Return how many findings you applied, what you deliberately left
and why, and the compile status.`,
    { label: 'fix:' + ch.id, phase: 'Verify', schema: FIX_SCHEMA, effort: 'high' }),
)

const drafted = (chapterResults || []).filter(Boolean)
log('Chapters drafted & fixed: ' + drafted.length + '/' + DRAFT_CHAPTERS.length
  + ' (Section I is written after Assemble, in the Synthesis phase)')

// =================================================================== PHASE D: appendices, assemble, full compile
phase('Assemble')
log('Phase D: appendices, assembly, notation unification, full build.')

// Appendices carry the long proofs that chapters forward-reference (e.g. the
// matrix-tree theorem), the operational checklist, the formula sheet, and the
// number->script traceability table.
await agent(`Write ${OUT}/chapters/appendices.tex (begin with \\appendix then \\chapter{...} per
appendix). Include:
 (A) FULL proofs of any theorem that the chapters stated but forward-referenced (unpack the
     source's compressed proofs completely; no "standard"/"sketch" on load-bearing steps);
 (B) a one-page OPERATIONAL CHECKLIST — the end-to-end recipe written so a reader can run it on a
     NEW instance/network;
 (C) a FORMULA SHEET (the boxed key results);
 (D) a table mapping every number used in the notes to the script in ${CODE} or the verifier under
     ${OUT} that produces it.
Read ${CONTRACT} and ${NUMBERS} first. ${STANDARDS}
Self-check with  bash "${OUT}/compile_one.sh" "${OUT}/chapters/appendices.tex"  until PASS. Return
a summary.`,
  { label: 'appendices', phase: 'Assemble', effort: 'high' })

const assembleResult = await agent(`Assemble and globally polish the full lecture notes. Run
  bash "${OUT}/build_all.sh"
and drive the WHOLE document ${MASTER} to a CLEAN three-pass pdflatex build. Fix cross-file issues:
undefined references, duplicate labels, inconsistent notation/macro use across chapters (reconcile
against ${CONTRACT}), broken \\includegraphics paths (copy needed PDFs from ${FIGS} into
${OUT}/figs/ and normalize to figs/<name>.pdf), TOC/numbering, and any LaTeX errors or overfull-box
disasters. ${BIB !== 'off' ? `WIRE THE BIBLIOGRAPHY: the chapters cite keys from ${BIBFILE} (the
verified ledger is ${CITATIONS}). Ensure refs.bib sits next to the master, uncomment/add the
\\bibliographystyle{unsrt} + \\bibliography{refs} lines at the master's bibliography hook, and
drive the pdflatex/bibtex/pdflatex x2 cycle (build_all.sh auto-detects the uncommented line) to
ZERO undefined citations. Any \\cite key missing from the ledger is a defect in the CHAPTER (fix
the cite or drop it) — never invent a bib entry to silence it. ` : ''}Ensure ONE coherent arc:
consistent symbols, working forward/back references, no redefinitions. Do NOT rewrite chapter
content beyond what coherence/compilation requires (and never "simplify" preamble.tex to dodge an
error — fix the offending chapter). Return: final compile status, page count, residual warnings
worth noting.`,
  { label: 'assemble', phase: 'Assemble', schema: FIX_SCHEMA, effort: 'high' })

log('Assembly compiles: ' + (assembleResult ? assembleResult.compiles : 'unknown'))

// =================================================================== PHASE E: synthesis — Section I from the finished book
phase('Synthesis')

// Section I (the chapter marked synthesis:true) can only be written NOW: it
// summarizes the FINISHED chapters — facts, not plans. This phase runs in BOTH
// modes: light mode never trims it.
const SYNTH = CHAPTERS.find(c => c.synthesis)
if (!SYNTH) {
  log('Synthesis: no chapter marked synthesis:true in CHAPTERS — skipping the phase.')
} else {
  log('Phase E: writing Section I — the PRL-style opening article — from the finished chapters,'
    + ' then compressing it into the 1-2 page zero-formula Preface.')

  // E1: the writer reads the whole finished book, then writes the article.
  await agent(`Write SECTION I of the lecture notes — Chapter ${SYNTH.num}, "${SYNTH.title}" —
into ${chFile(SYNTH.id)} (OVERWRITE the stub; begin with \\chapter{${SYNTH.title}}\\label{ch:${SYNTH.id}}).

BEFORE WRITING, read the FINISHED book: EVERY drafted chapter file in ${OUT}/chapters/,
${CONTRACT} (notation, labels, theorem environments), and the SECTION HEADERS of ${NUMBERS} (to
know what ground truth exists — you will NOT quote its numbers here). You are summarizing a
finished book: state facts, never plans.

${STANDARDS}

THE SECTION-I DESIGN (follow it exactly; for THIS chapter it OVERRIDES the standards' full-proof
and numbers items — proofs and numbers live in the body chapters):
- Section I is a PRL-STYLE STANDALONE ARTICLE that replaces a conventional prologue:
  physics-first storytelling; the FIRST paragraph answers why the problem matters; intuition and
  "what is the physics behind this" carried through the whole piece.
- EVERY major theorem of the notes appears as a FORMAL STATEMENT — precise assumptions +
  conclusion, in a real theorem environment, NO proof, no mechanism footnote — embedded at the
  story's load-bearing points, so the COMPLETE LOGICAL CHAIN (what implies what, via which
  assumption) is visible at a glance. Each formal statement carries an explicit pointer to the
  chapter where it is proved.
- Objects pay only a WORKING-DEFINITION tax: 1-2 lines, precise enough to parse the formal
  statements, plus a pointer to the rigorous definition in the body.
- Proofs, proof-sketch levers, and NUMBERS stay in the body chapters — none of them here.
- SUCCESS TEST (the D-test): a reader of Section I ALONE must be able to say "I believe / don't
  believe the paper's central claim, because ..." — judgment powered by the logical chain.
- GUIDANCE DEVICES (both required): (1) a theorem-dependency DAG figure (TikZ), nodes tagged
  with the chapter/section numbers where the proofs/details live; (2) reader-type READING
  ROUTES (e.g. user / verifier / teacher paths) telling each reader which chapters to visit.
- FIGURES: exactly the DAG plus ONE no-numbers phenomenon/mechanism story schematic.
  Spec: ${SYNTH.figures} Numeric figures stay in the body.
- LENGTH: 8-12 pages, one-sitting readable; scale with content.
- FORBIDDEN GENES (inherited from PRL — never reproduce): novelty-selling tone ("first ever",
  breakthrough talk); citation politics; compression pain ("it can be shown").

CHAPTER BRIEF (the worked spec for this book):
${SYNTH.covers}

SELF-CHECK before finishing: run  bash "${OUT}/compile_one.sh" "${chFile(SYNTH.id)}"  and fix
every LaTeX error until it reports PASS. Do not finish on a FAIL. Return: the chain of formally
stated theorems (each with its chapter pointer), the figures, and the compile status.`,
    { label: 'synthesis-write', phase: 'Synthesis', effort: 'high' })

  // E2: adversarial verification — the D-test proxy.
  const synthReview = await agent(`ADVERSARIAL REVIEW of Section I at ${chFile(SYNTH.id)} — the
D-test proxy. Read it against the finished chapters in ${OUT}/chapters/ and check, precisely:
(a) every core-chapter main theorem is FORMALLY STATED (precise assumptions + conclusion, real
    theorem environment) — list any that is missing;
(b) the logical chain is COMPLETE: no orphan claims — every claim is either formally stated or
    explicitly follows from stated ones, with the licensing assumption named;
(c) every symbol used carries a WORKING DEFINITION (1-2 lines) before use, with a pointer to the
    rigorous definition's chapter;
(d) NO proofs or proof sketches leaked in;
(e) no forbidden genes: novelty-selling tone, citation politics, "it can be shown" compression;
(f) the theorem-dependency DAG figure is present and its nodes carry the CORRECT chapter/section
    tags (cross-check against the actual chapter files);
(g) the reader-type reading routes are present;
(h) the length is in the 8-12 page band.
Give a concrete fix for each finding.`,
    { label: 'synthesis-verify', phase: 'Synthesis', schema: FINDINGS_SCHEMA, effort: 'high' })

  // E3: apply blockers/majors only if the review found any (null-guarded).
  const synthIssues = ((synthReview && synthReview.findings) || [])
    .filter(f => f.severity === 'blocker' || f.severity === 'major')
  if (synthIssues.length) {
    await agent(`Apply fixes to Section I at ${chFile(SYNTH.id)}. The adversarial review found:
${renderFindings(synthIssues)}

Resolve every blocker and major while keeping the Section-I design intact (formal statements
only, working definitions with pointers, no proofs, no numbers, DAG + reading routes, PRL-style
physics-first story, 8-12 pages). Recompile with
  bash "${OUT}/compile_one.sh" "${chFile(SYNTH.id)}"  until PASS, then do ONE quick full rebuild:
  bash "${OUT}/build_all.sh"  and confirm the master still builds clean. Return what you applied
and both compile statuses.`,
      { label: 'synthesis-fix', phase: 'Synthesis', schema: FIX_SCHEMA, effort: 'high' })
  }

  // E4: compress the finished Section I into the PREFACE — the first layer of the
  // COMPRESSION TELESCOPE. Written LAST by design: the compression chain is strictly
  // one-way (body -> Section I -> Preface), so this step follows the Section I fix pass.
  const prefaceWrite = await agent(`Write the PREFACE of the lecture notes into ${PREFACE} — the
FIRST layer of the notes' COMPRESSION TELESCOPE. The notes tell ONE story at three zoom levels,
each a lossy compression of the next, each complete at its own resolution ("compression is
intelligence"): the Preface (1-2 pages) lets a reader RETELL the result to an outsider AND
EXPLAIN THE MECHANISM — why it holds, what competes with what, where the tension resolves (the
INSIGHT TEST: retell + explain-why); Section I (8-12 pages) lets a reader JUDGE the paper's
central claim (the D-test); the body (full notes) lets a reader REBUILD every proof and number.

READ ONLY: the FINISHED Section I at ${chFile(SYNTH.id)} (your sole content source) and
${CONTRACT} (for terminology only). Do NOT open the body chapters, the paper, or ${NUMBERS} —
the compression chain is strictly one-way: body -> Section I -> Preface.

PREFACE RULES (all enforceable; the blind insight-test verifier checks each):
- RADICAL ZERO-FORMULA: no display math, no equations, no relational math (=, inequalities,
  arrows-as-implication) anywhere; inline math symbols at most as proper NAMES (budget: a few,
  each defined in words in the same sentence). No figures either — the preface IS a picture
  painted in words.
- PHYSICAL-PICTURE-FIRST PROSE, not dry summary. 物理图像 here means the MENTAL picture of the
  physics — mechanism-level intuition, NOT literal drawings or figures. Every claim is carried
  by its WHY: the causal story, the competing effects, the reason the result is forced.
  Insight-dense: each paragraph must earn an "aha"; a sentence that states WHAT without
  transmitting WHY is a defect. 物理图像清晰 (a vivid, insightful physical picture) is the
  primary quality bar.
- STRICT COMPRESSION OF SECTION I: introduces ZERO claims not present in Section I; every
  sentence traceable; every sentence load-bearing (if deleting it loses nothing, it goes).
- No hedging, no citations, no novelty-selling.
- ~600-900 words, HARD CAP 2 typeset pages (checked mechanically in the built PDF).
- Contains the READING CONTRACT: a tiny table of the three layers and what competence each
  purchase buys (retell + explain-why / judge / rebuild). A table is prose, not a formula —
  allowed.
- Placement: unnumbered front matter between the title page and the table of contents.

DELIVERABLES:
1. ${PREFACE} — begins with \\chapter*{Preface} (add \\addcontentsline{toc}{chapter}{Preface}
   only if it reads tastefully in the TOC).
2. Wire the hook: in ${MASTER}, insert — or uncomment, if the scaffold's commented
   "% \\input{preface}" hook is present — the line \\input{preface} BETWEEN \\maketitle and
   \\tableofcontents.
3. SELF-CHECK: run  bash "${OUT}/build_all.sh"  and fix every error until the front matter
   compiles clean.

Return: the preface word count, its typeset page count in the built PDF (must be <= 2), and the
compile status.`,
    { label: 'preface-write', phase: 'Synthesis', effort: 'high' })
  log('Preface: ' + (prefaceWrite ? String(prefaceWrite).slice(0, 300) : 'writer returned nothing'))

  // E5: the BLIND INSIGHT-TEST — the Preface's analogue of the D-test proxy. The
  // verifier reads the preface FIRST and commits to an understanding before diffing.
  const prefReview = await agent(`BLIND INSIGHT-TEST of the Preface at ${PREFACE}. Follow this
PROTOCOL ORDER exactly — the blindness is the point:
STEP 1 (blind): read ONLY ${PREFACE}. From its words alone, write out (a) a RETELLING of the
result as you would give it to an outsider, and (b) the MECHANISM as you understood it — why the
result holds, what pushes what, where the tension resolves. Commit to this BEFORE opening
anything else.
STEP 2 (diff): only NOW open Section I at ${chFile(SYNTH.id)} and diff your Step-1 understanding
against it. File findings for:
(a) INSIGHT GAPS: claims whose WHY the prose failed to transmit (you could repeat the WHAT but
    not explain the mechanism);
(b) MECHANISM MISREADINGS the prose permitted (your Step-1 mechanism was wrong and the wording
    allowed it);
(c) ORPHAN CLAIMS: anything in the preface not present in Section I (strict compression);
(d) FORMULA / RELATIONAL-MATH LEAKS: also grep the .tex for math environments and display math
    (equation, align, \\[, $$) and for relational math (=, inequalities, implication arrows)
    used as content rather than as a defined proper name;
(e) MISSING READING-CONTRACT TABLE (the three layers and what competence each purchase buys:
    retell + explain-why / judge / rebuild);
(f) HEDGING / CITATION / NOVELTY-SELLING genes;
(g) PAGE-CAP OVERRUN: check the built PDF's page count for the preface — more than 2 typeset
    pages is a violation.
Severity calibration: insight gaps, mechanism misreadings, orphan claims, formula leaks, a
missing reading contract, and page overruns are blocker/major findings. Give a concrete fix for
each.`,
    { label: 'preface-verify', phase: 'Synthesis', schema: FINDINGS_SCHEMA, effort: 'high' })

  // E6: apply blockers/majors only if the insight test found any (null-guarded).
  const prefIssues = ((prefReview && prefReview.findings) || [])
    .filter(f => f.severity === 'blocker' || f.severity === 'major')
  if (prefIssues.length) {
    await agent(`Apply fixes to the Preface at ${PREFACE}. The blind insight-test found:
${renderFindings(prefIssues)}

Resolve every blocker and major while keeping the Preface design intact: a 1-2 page zero-formula
compression of Section I ONLY (zero new claims), physical-picture-first prose in which every
claim carries its WHY, the reading-contract table, no hedging/citations/selling, ~600-900 words.
Then rebuild with  bash "${OUT}/build_all.sh"  until clean and confirm the preface still fits in
2 typeset pages. Return what you applied and the compile status.`,
      { label: 'preface-fix', phase: 'Synthesis', schema: FIX_SCHEMA, effort: 'high' })
  }
}

// =================================================================== PHASE F: professional typesetting layer
phase('Typeset')
log('Phase F: layering the professional typographic design onto the finished content (sandbox first, LOOK, then live).')

const typesetResult = await agent(`Apply the PROFESSIONAL TYPESETTING LAYER to the assembled lecture notes in ${OUT}.
The content is finished and builds clean with the plain preamble; your job is to swap in the
professional design WITHOUT touching chapter content — the two-stage layering discipline of the
skill's typesetting_guide.md. Resolve pdflatex probe-style: "command -v pdflatex" if on PATH;
else ${TEXBIN}/pdflatex; else /Library/TeX/texbin/pdflatex (macOS MacTeX); else
/usr/local/texlive/*/bin/*/pdflatex (Linux TeX Live). pdftoppm ships with poppler(-utils).

STEPS, IN ORDER:
1. BACK UP the current plain preamble to ${OUT}/preamble_plain_backup.tex (keep it forever).
2. OBTAIN the professional preamble:
${SKILLREF ? `   Use the shipped, compile-tested ${SKILLREF}/references/preamble_lecture_notes.tex, applied
   per ${SKILLREF}/references/typesetting_guide.md. Adapt ONLY its clearly-marked customization
   points (title-page subtitle hook, paper-specific macros): carry over EVERY macro and
   environment name the chapters already use, changing no calling convention.` : `   Author it from this compact spec (distilled from typesetting_guide.md sections 2-4):
   - documentclass[11pt,oneside]{report}; geometry with headheight=14pt and generous ~1.25in
     margins; \\linespread{1.06}; block paragraphs (\\parindent 0pt, \\parskip 5pt plus 1pt).
   - PACKAGE STACK IN THIS LOAD ORDER: fontenc[T1], inputenc[utf8]; amsmath, amssymb, mathtools,
     amsthm; FONTS: tgheros (sans), then newpxtext (Palatino-like serif body), then newpxmath
     (AFTER newpxtext), then bm, beramono[scaled=0.86]; microtype LATE (after all fonts);
     geometry, graphicx, xcolor, booktabs, colortbl, enumitem, caption; tcolorbox[most]; tikz (+ the
     libraries the chapters use); titlesec; fancyhdr; needspace; hyperref LAST — and ALL
     \\hypersetup / palette / titlesec / fancyhdr / theorem styling AFTER hyperref. Font
     fallbacks if newpx/tgheros are missing on this TeX: libertinus, else lmodern.
   - THE KEY TRICK (this ordering is load-bearing): declare the amsthm theorem machinery FIRST —
     \\newtheoremstyle header styles (sans bold colored headers, e.g. navy for results, deepened
     teal for definitions, deepened gold for examples, italic inkgray for remarks), then
     \\newtheorem with theorem driving ONE chapter-scoped shared counter (proposition, lemma,
     corollary aliased to it; then definition, example, remark) — and only THEN wrap each
     EXISTING environment with \\tcolorboxenvironment{NAME}{enhanced jigsaw, breakable,
     boxrule=0pt, frame hidden, sharp corners, colback=<accent>!5 to !7,
     borderline west={3pt}{0pt}{<accent>}, generous left/right/top/bottom padding} so chapters
     still write \\begin{theorem}...\\end{theorem} unchanged. Look: left color bar + faint tint,
     NO full frame. Color coding: navy = theorem/proposition/lemma/corollary; teal = definition;
     gold = example; inkgray (thinner 2.2pt bar, black!3 tint) = remark. Keep the existing
     keyresult \\newtcolorbox as a stronger gold-framed callout with an attached boxed title.
   - THE 5-COLOR PALETTE (exact, define once, use everywhere):
     \\definecolor{navy}{HTML}{1f3b73}  \\definecolor{mpred}{HTML}{c0392b}
     \\definecolor{teal}{HTML}{16887b}  \\definecolor{gold}{HTML}{b8860b}
     \\definecolor{inkgray}{HTML}{4a4a4a};
     \\hypersetup{linkcolor=navy, citecolor=teal, urlcolor=mpred, bookmarksnumbered=true}.
   - HEADINGS (titlesec): display-style \\chapter — a HUGE raggedleft chapter number at 22%
     opacity (navy!22) above a \\Huge navy sans title with a faint navy!22 \\titlerule beneath;
     navy sans \\section/\\subsection. RUNNING HEADERS (fancyhdr): chapter left / section right
     in small gray sans, navy page number centered in the footer; a plain style (footer only)
     for chapter-opening pages. CAPTIONS: small, sans, bold navy label, period separator.
   - TITLE PAGE: redefine \\maketitle — two full-width navy rules around a large (~30pt) navy
     sans title, an italic subtitle via a \\providecommand{\\notessubtitle}{...} hook the master
     can \\renewcommand, then author and date. The master file itself stays untouched.`}
3. SANDBOX FIRST: copy the FULL project (master, preamble, chapters/, figs/, build scripts) to
   ${OUT}/typeset_sandbox/, swap the professional preamble in THERE, and run a full THREE-PASS
   pdflatex build. On any compile failure: fix the offending CHAPTER construct (or add the
   missing macro/alias in the preamble's customization block) — NEVER downgrade or simplify the
   professional design to dodge an error.
4. LOOK AT IT: render the title page, one chapter-opener page, and one theorem-heavy page with
   pdftoppm (e.g. pdftoppm -png -r 110 -f <page> -l <page> <pdf> <prefix>) and READ the images.
   Use the PDF's own stem as the pdftoppm <prefix> so clean.sh's pair rule collects the renders later.
   Check: the title-page rules and fonts; the big faded chapter number and title rule; colored
   left-bar theorem/definition/example boxes; running headers and footer page number; palette
   coherence. Iterate in the sandbox until all three pages genuinely look right.
5. ONLY IF CLEAN: apply the professional preamble to the LIVE project (preamble_plain_backup.tex
   stays as the rollback), rebuild with  bash "${OUT}/build_all.sh"  to a clean three-pass build,
   and re-render the same three pages to confirm.

Return the structured report: source ('shipped' if you used the SKILLREF preamble, 'authored'
otherwise), sandboxCompiles, liveApplied (true ONLY if the professional preamble is live and the
live three-pass build is clean), pagesChecked (which pages you rendered), and notes (what you saw
on the rendered pages and any chapter constructs you fixed).`,
  { label: 'typeset', phase: 'Typeset', schema: TYPESET_SCHEMA, effort: 'high' })

// A failed typeset must NOT abort the run: the content is finished and still builds
// with the PLAIN preamble (preamble_plain_backup.tex holds the design of record in
// that case). Log it, carry on, and surface the outcome in the final return object.
const typesetOk = !!(typesetResult && typesetResult.liveApplied)
if (!typesetOk) {
  log('Typeset: professional layer NOT applied ('
    + ((typesetResult && typesetResult.notes) || 'agent returned nothing')
    + ') — continuing with the plain preamble; see `typeset` in the final return object.')
}

// =================================================================== PHASE G: figure visual check on the rendered PDF
phase('Figures')
log(MODE === 'light'
  ? 'Phase G: SKIPPED (light mode) — the figure visual-review loop runs only in full mode.'
  : 'Phase G: rendering the full PDF and visually checking every figure.')

if (MODE === 'full') {
  const figReview = await agent(`VISUAL FIGURE REVIEW. The compiled PDF is ${MASTER.replace(/\.tex$/, '.pdf')}.
Open/read it with the Read tool using PAGE RANGES (it renders PDF pages as images) and LOOK AT
EVERY FIGURE. Judge each as if for a top journal: is it correct (matches the text & ${NUMBERS}),
legible, uncluttered, well-labeled (bold panel letters; annotated key quantities), and free of
overlaps/clipping/overflow? Flag every figure that is broken, ugly, wrong, mislabeled, or missing,
with a concrete fix and its chapter file. If a figure is genuinely publication-grade, say so.`,
    { label: 'figure-visual-check', phase: 'Figures', schema: FINDINGS_SCHEMA, effort: 'high' })

  if (figReview && (figReview.findings || []).length) {
    await agent(`Fix the figures per this visual review (work in the relevant ${OUT}/chapters/*.tex):
${renderFindings(figReview.findings, 100)}
Improve the TikZ (and any reused-panel placement) to publication grade, then rebuild with
  bash "${OUT}/build_all.sh"  until it compiles clean. Re-read the rebuilt PDF pages for the figures
you changed to confirm they now look right. Figure style: use the document's sanctioned NAMED
colors (defined in the preamble; palette ${PALETTE}); bold panel letters; direct annotation of
the key quantities, per the project standards. Return what you changed and the compile status.`,
      { label: 'figure-fix', phase: 'Figures', schema: FIX_SCHEMA, effort: 'high' })
  }
}

// =================================================================== PHASE H: referee gate vs rubric, bounded fix loop
phase('Referee')
log('Phase H: scoring against the acceptance rubric; looping targeted fixes until hard gates pass and the score clears ' + THRESHOLD + '/100.')

// Bound derived from CONFIG (deterministic — no clock/RNG): 3 rounds in full
// mode, 1 in light mode (light is a draft-grade pass by design).
const MAX_REFEREE_ROUNDS = MODE === 'light' ? 1 : 3
let score = null
for (let round = 0; round < MAX_REFEREE_ROUNDS; round++) {
  score = await agent(`SENIOR REFEREE — final acceptance gate for the lecture notes. Read the
master ${MASTER}, the chapters in ${OUT}/chapters/, the compiled PDF (skim rendered pages),
${NUMBERS}, and the rubric.

Score against this rubric and evaluate every HARD GATE honestly:
${RUBRIC}

Core chapters (the running example MUST appear in each): ${coreIds.join(', ') || '(none flagged core)'}.

Be a strict, adversarial referee (peer-review-level scrutiny). For each dimension give a score out
of its max with specific notes. Set each hard gate true ONLY if genuinely satisfied. List the
concrete BLOCKERS that must be fixed (file + what + how). Verify in particular: every theorem has a
complete proof; no load-bearing concept is merely cited; all numbers match numbers.md; the primary
example's structural invariant holds; it compiles. The numbersMatch gate is the WIDENED G2 —
ground truth for numbers AND citations: set it true only if every number matches ${NUMBERS} AND,
wherever the notes cite, every \\cite resolves to an entry in ${BIB !== 'off' ? CITATIONS : 'the citations ledger (none for this run — the notes must then contain no \\cite)'} (spot-re-resolve 2-3
identifiers yourself by an actual lookup; a fabricated or unresolvable reference fails the gate).
Also verify NUMBERS-AS-FIGURES: every
load-bearing quantity in ${NUMBERS} must appear in at least one figure or professionally typeset
table, not only inline — file a BLOCKER for each violation and deduct under the Visualization
dimension (this is scoring pressure, NOT a seventh hard gate).${BIB !== 'off' && POSCH ? ` Also
evaluate the CONTEXT & POSITIONING section (in ${chFile(POSCH.id)}, the document's ONLY
positioning home — the Preface and Section I must stay citation-free): it must position (i) the
RESULT against the research literature (builds-on / sits-beside / adds, every claim about a paper
cited from the ledger) and (ii) THESE NOTES against existing expositions; the keyed literature-map
figure must be present with its node keys resolving to ${BIBFILE}; no novelty-selling, no citation
politics. Deduct violations under dimensions 5 (citation integrity) and 7 (context) and file
BLOCKERS for them — scoring pressure, NOT a seventh hard gate.` : ''}${SYNTH ? ` Also evaluate SECTION I
(the opening article, ${chFile(SYNTH.id)}) against the D-test and its design criteria: a reader
of Section I ALONE can judge the paper's central claim ("I believe / don't believe, because ...")
via a complete chain of FORMALLY STATED results (assumptions + conclusion, NO proofs); working
definitions with pointers to the rigorous versions; the theorem-dependency DAG with correct
chapter/section tags; reader-type reading routes; a PRL-style physics-first story with no selling
tone, no citation politics, no "it can be shown"; 8-12 pages. Deduct violations under dimensions
1 (Self-containedness) and 7 (Pedagogical flow) and file BLOCKERS for them — again scoring
pressure, NOT a seventh hard gate. Also evaluate the PREFACE (${PREFACE}, unnumbered front
matter before the TOC) in the insight-test spirit: from its words alone a reader can RETELL the
result AND EXPLAIN THE MECHANISM (why it holds, what pushes what, where the tension resolves);
RADICAL zero-formula (no equations, no relational math; inline symbols only as proper names
defined in words); STRICT compression of Section I (zero claims not in Section I); the
reading-contract table present; no hedging/citations/selling; at most 2 typeset pages in the
built PDF. Deduct violations under dimensions 1 and 7 and file BLOCKERS for them — again scoring
pressure, NOT a seventh hard gate.` : ''} Return the structured score.`,
    { label: 'referee-r' + round, phase: 'Referee', schema: SCORE_SCHEMA, effort: 'high' })

  const gatesPass = allGatesPass(score && score.hardGates)
  const nBlockers = score ? (score.blockers || []).length : '?'
  log(`Referee round ${round}: total=${score ? score.total : '?'}/100 (threshold ${THRESHOLD}); hard gates ${gatesPass ? 'ALL PASS' : 'NOT yet'}; blockers=${nBlockers}`)

  if (gatesPass && ((score && score.total) || 0) >= THRESHOLD
      && (!score.blockers || score.blockers.length === 0)) break
  if (round === MAX_REFEREE_ROUNDS - 1) break   // out of rounds; stop after scoring

  // Fix the referee's blockers (or, if none listed, the lowest-scoring dimensions).
  const lowestDims = ((score && score.dimensions) || []).slice()
    .sort((a, b) => (a.score / a.max) - (b.score / b.max)).slice(0, 3).map(d => d.name).join(', ')
  await agent(`Resolve the referee's BLOCKERS for the lecture notes. Blockers:
${((score && score.blockers) || []).map((b, i) => (i + 1) + '. ' + b).join('\n') || '(none listed — address the lowest-scoring rubric dimensions: ' + lowestDims + ')'}

${STANDARDS}

Edit the relevant ${OUT}/chapters/*.tex to fix each blocker PROPERLY (not superficially): add the
missing proof/explanation, correct numbers vs ${NUMBERS}, ensure the structural invariant is
explicit, etc. Then rebuild with  bash "${OUT}/build_all.sh"  until clean. Return what you changed
and the compile status.`,
    { label: 'referee-fix-r' + round, phase: 'Referee', schema: FIX_SCHEMA, effort: 'high' })
}

// Explicit acceptance verdict (mirrors the rubric: gates AND threshold AND zero blockers).
const accepted = !!(score && allGatesPass(score.hardGates)
  && ((score.total || 0) >= THRESHOLD)
  && (score.blockers || []).length === 0)
if (!accepted) {
  log('NOT ACCEPTED after ' + MAX_REFEREE_ROUNDS + ' referee round(s): '
    + 'score=' + (score ? score.total : '?') + '/100 (threshold ' + THRESHOLD + '), '
    + 'gates ' + (allGatesPass(score && score.hardGates) ? 'pass' : 'NOT all pass') + ', '
    + 'blockers=' + (score ? (score.blockers || []).length : '?'))
}
if (MODE === 'light') {
  log('LIGHT MODE: output is draft grade — rubric compliance not claimed.')
}

// Final clean build (idempotent; only fixes build-breakers).
const finalBuild = await agent(`Do the FINAL build of ${MASTER}: run  bash "${OUT}/build_all.sh"
(three passes). Confirm it compiles clean; report the page count and any residual warnings. Do not
change content except to fix a build-breaking error. THEN tidy the project: run
  bash "${OUT}/clean.sh" --yes
(whitelist housekeeping: removes LaTeX aux files, _single_* wrappers, root-level render PNGs,
typeset_sandbox/, pycache/.DS_Store; keeps sources, chapters, figs/, code/, numbers.md,
citations.md, refs.bib, contract.md, *.bbl, preamble_plain_backup.tex, and the final PDF). If
clean.sh is missing (scaffold predates it), skip tidying — never improvise deletions. Report what
was removed. Return the final status and page count.`,
  { label: 'final-build', phase: 'Referee', schema: FIX_SCHEMA })

return {
  mode: MODE,
  grade: MODE === 'light' ? 'draft grade — rubric compliance not claimed' : 'full',
  accepted,
  threshold: THRESHOLD,
  bib: BIB,                                    // literature-layer mode ('off' = no citations)
  citationsLedger: BIB !== 'off' ? CITATIONS : null,
  typeset: typesetOk
    ? 'professional (' + (typesetResult.source || 'unknown') + ' preamble)'
    : 'FAILED — plain preamble in use (see preamble_plain_backup.tex)',
  chaptersDone: drafted.length,
  totalChapters: DRAFT_CHAPTERS.length,
  synthesisChapter: SYNTH ? SYNTH.id : null,   // Section I, written in the Synthesis phase
  exampleHeadline: exDesign ? String(exDesign).slice(0, 600) : null,
  finalScore: score ? score.total : null,
  hardGates: score ? score.hardGates : null,
  blockers: score ? score.blockers : null,
  finalCompiles: finalBuild ? finalBuild.compiles : null,
  output: MASTER.replace(/\.tex$/, '.pdf'),
}
