# Phase 3.1 — Sarabo Content Review

**Date:** 2026-08-06
**Branch:** `master`
**Starting HEAD:** `3b993c9` (`feat: add project system and sarabo case study`)
**Scope:** Editorial/evidence review of the Sarabo case study, featured-project selection, and archive candidates. No implementation.

## 1. Review Summary

The Sarabo case study at `/work/sarabo` contains **no invented facts**. Every rendered claim traces to either a confirmed line in `CONTENT_CHECKLIST.md` §7 or a low-risk inference composed from those confirmed lines. Two areas deserve cautious-wording attention before the content is treated as fully final: the **workflow section**, which presents an inferred six-step operational sequence with a precision the source evidence doesn't document, and the **"Engineering decisions" heading**, which frames two checklist-confirmed technical facts using language that implies deliberate senior-level rationale not actually documented. Neither is factually wrong or materially misleading enough to require an immediate source-code fix — both are flagged here as recommended cautious-wording revisions for the user to approve, per the review-only default for this phase. No production source files were changed.

Featured-project selection is already correctly calibrated: Sarabo is the sole flagship case study; Bang Learner and Note Bank render as honest "in preparation" cards, not inflated case studies. This is confirmed as the right call, not revised. No archive candidate currently has enough confirmed evidence to publish.

## 2. Evidence Classification

| Claim | Classification | Source |
|---|---|---|
| Title, one-line problem statement | VERIFIED | `CONTENT_CHECKLIST.md` §7, checked |
| Live client URL, live API URL | VERIFIED | `CONTENT_CHECKLIST.md` §7, checked |
| 7 confirmed key features (roles, auth, request tracking, assignment, quotation, notifications, reviews, Stripe) | VERIFIED | `CONTENT_CHECKLIST.md` §7 "Confirmed key features," checked |
| 5 confirmed technical decisions (React client, Node/Express, MongoDB, Firebase auth/hosting, separate deployments) | VERIFIED | `CONTENT_CHECKLIST.md` §7 "Confirmed technical decisions," checked |
| Role names: Customer, Technician, Administrator | VERIFIED | Directly named in the confirmed feature list |
| Role *descriptions* (e.g. "pays through Stripe, and leaves reviews") | SUPPORTED INFERENCE | Composed by combining verified feature list items per role; not separately documented per-role |
| Workflow step *existence* (request, quotation, assignment, repair, payment, review) | SUPPORTED INFERENCE | Each step name maps to a confirmed feature; the grouping into steps is an interpretation |
| Workflow step *ordering* (quotation before assignment, assignment before repair, etc.) | SUPPORTED INFERENCE | No documented process defines this exact order; it is a plausible but unverified sequence |
| Architecture layer *existence* (React client, Firebase auth, Express API, MongoDB, Stripe) | VERIFIED | Each layer is a directly confirmed technical decision or feature |
| Architecture layer *descriptions* | SUPPORTED INFERENCE | Written narrative around each layer, not copied from documentation |
| "Engineering decisions" — underlying facts (separate deployments; Firebase auth + custom API) | VERIFIED | Directly listed in "Confirmed technical decisions" |
| "Engineering decisions" — heading/framing and rationale language ("rather than as a single combined service") | SUPPORTED INFERENCE | Implies deliberate weighing of alternatives not documented anywhere |
| Exact role, team size, timeline, repo URLs, docs URL, status detail | USER CONFIRMATION REQUIRED | `CONTENT_CHECKLIST.md` §7, unchecked `TODO_CONTENT` |
| Challenges, outcome, reflection/next steps, cover image, screenshots, demo video | USER CONFIRMATION REQUIRED | `CONTENT_CHECKLIST.md` §7, unchecked `TODO_CONTENT` |
| Any business outcome, adoption, or scale claim | OMIT | Not present anywhere in current rendering — correctly absent |

## 3. Workflow Review

Current rendering: six `ProjectSection` steps under heading "Workflow," each with a short label and one-sentence description (`client/src/data/projects.js` lines 100–129, rendered via `ProjectWorkflow`).

| Step | Current wording | Evidence | Classification | Risk |
|---|---|---|---|---|
| 1. Request submitted | "A customer creates a repair request for a device." | Confirmed feature: repair-request lifecycle tracking | VERIFIED (existence) | Low |
| 2. Quotation provided | "The request is reviewed and a quotation is issued." | Confirmed feature: quotation management | SUPPORTED INFERENCE (that this is step 2, before assignment) | Low–moderate |
| 3. Technician assigned | "Once a quotation is accepted, a technician is assigned to the request." | Confirmed feature: technician assignment | SUPPORTED INFERENCE (that assignment follows quotation acceptance) | Moderate — "once a quotation is accepted" asserts a specific gating condition not documented |
| 4. Repair in progress | "The technician works the request and progress is tracked through the lifecycle." | Confirmed feature: repair-request lifecycle tracking | SUPPORTED INFERENCE | Low |
| 5. Payment | "The customer completes payment through the Stripe payment flow." | Confirmed feature: Stripe payment flow | SUPPORTED INFERENCE (that payment happens after repair, not at quotation) | Moderate |
| 6. Review | "The customer leaves a review once the repair is complete." | Confirmed feature: customer reviews | SUPPORTED INFERENCE (timing) | Low |

**Assessment:** No step introduces a fact outside the confirmed feature list — every noun in the workflow (request, quotation, assignment, repair, payment, review) is independently confirmed. The risk is entirely in the *sequencing and gating language* ("once a quotation is accepted," implying that specific dependency), which is plausible for a repair-service platform but not verified. This does not rise to "clearly unsafe" (no operational, business, or technical falsehood), so it is not corrected in this pass, but it should not be treated as more authoritative than it is.

**Recommended final wording (for user approval, not yet applied):**

> The interface supports a request lifecycle that moves through service selection, request submission, assignment-related handling, progress tracking and payment-related states.

This single-paragraph phrasing preserves every confirmed capability while removing the implied exact gating order. Applying it would mean removing the current six-item step list and its per-step "once X, then Y" language, or keeping the list but stripping the ordering/gating claims from each description. **Recommend the user choose one of these two options before this section is called final** — see Section 13, Q8.

**Public readiness: READY WITH CAUTIOUS WORDING.** It can remain published as-is (nothing false), but the softer phrasing is the safer long-term choice once the user confirms which of the two options they want.

## 4. Engineering-Decision Review

Current rendering: two bullet items under heading "Engineering decisions" (`client/src/data/projects.js` lines 157–160).

### Decision 1

- **Current heading:** "Engineering decisions" (shared heading for both items)
- **Current description:** "The React client and the Express API were built and deployed separately (the client via Firebase Hosting, the API on its own deployment) rather than as a single combined service."
- **Evidence:** `CONTENT_CHECKLIST.md` §7 confirms "Separate client and server deployments" as a checked technical decision.
- **Classification:** Underlying fact VERIFIED. The clause "rather than as a single combined service" is SUPPORTED INFERENCE — it frames the fact as a deliberate choice weighed against an alternative, which is not documented.
- **True decision or implementation-derived interpretation:** The *fact* (separate deployments) is documented. The *framing* (as a considered decision with a rejected alternative) is an interpretation.
- **Recommended heading:** "Implementation approach" (instead of "Engineering decisions")
- **Recommended wording:** "The React client and the Express API are deployed separately — the client via Firebase Hosting, the API on its own deployment."
- **Verdict:** REVISE (heading and trailing clause only; the core fact stays)

### Decision 2

- **Current heading:** "Engineering decisions" (shared heading)
- **Current description:** "Firebase handles authentication while a custom Express and MongoDB API manages repair-request, quotation, and role data."
- **Evidence:** `CONTENT_CHECKLIST.md` §7 confirms "Firebase authentication/hosting integration," "Node.js and Express API," and "MongoDB persistence" as checked technical decisions.
- **Classification:** VERIFIED at the fact level (all three technologies and their roles are confirmed). The sentence does not add unverified rationale, unlike Decision 1.
- **True decision or implementation-derived interpretation:** Directly documented composition of confirmed facts — closer to VERIFIED than Decision 1.
- **Recommended heading:** "Implementation approach" (shared with Decision 1, for consistency)
- **Recommended wording:** No change needed to this sentence.
- **Verdict:** PUBLISH AS-IS (only the shared heading changes)

**Overall recommendation:** Rename the section heading from "Engineering decisions" to **"Implementation approach"** in both `client/src/data/projects.js` (the `sections` array, `decisions` entry) and `client/src/pages/ProjectDetailsPage.jsx` (`ProjectSection id="decisions" heading="Engineering decisions"`), and trim the "rather than as a single combined service" clause from Decision 1. This is a wording-precision improvement consistent with `CLAUDE.md`'s rule against presenting Jahid as a senior/expert engineer — "engineering decision" implies weighed, deliberate architectural reasoning that isn't documented, where "implementation approach" accurately describes what's confirmed: what was built, not why it was chosen over alternatives.

This was evaluated against the "clearly unsafe or factually unsupported" bar for an in-pass fix and judged to fall just short of it (nothing false is stated) — so it is **not applied automatically**. It is presented in Section 7 and Section 13 (Q9) for explicit user approval, consistent with the "review-only by default" instruction for this phase.

## 5. Section-by-Section Readiness

| Section | Current status | Evidence level | Public readiness | Required action |
|---|---|---|---|---|
| Hero | Rendered | VERIFIED | READY | None |
| Overview | Rendered | VERIFIED | READY | None |
| Problem | Folded into Overview/summary, not a separate section | VERIFIED | READY | None — no separate "Problem" heading exists; the one-line problem statement already appears in the summary and overview |
| Roles | Rendered | Role names VERIFIED; descriptions SUPPORTED INFERENCE | READY WITH CAUTIOUS WORDING | None required; descriptions are low-risk paraphrases of confirmed features |
| Workflow | Rendered | SUPPORTED INFERENCE (sequencing) | READY WITH CAUTIOUS WORDING | User to choose narrative-paragraph vs. trimmed-step-list per Section 3 |
| Capabilities | Rendered | VERIFIED | READY | None |
| Architecture | Rendered | Layers VERIFIED; descriptions SUPPORTED INFERENCE | READY WITH CAUTIOUS WORDING | None required; descriptions are low-risk |
| Engineering decisions | Rendered | Facts VERIFIED; framing SUPPORTED INFERENCE | READY WITH CAUTIOUS WORDING | Rename heading to "Implementation approach"; trim one clause — pending user approval |
| Challenge | Omitted (renders restrained note) | USER CONFIRMATION REQUIRED | WAITING FOR USER | Await Q3/Q4 answers |
| Outcome | Omitted (renders restrained note) | USER CONFIRMATION REQUIRED | WAITING FOR USER | Await Q5 answer |
| Reflection / next steps | Omitted (renders restrained note) | USER CONFIRMATION REQUIRED | WAITING FOR USER | Await Q5 answer |
| Related projects | Rendered | VERIFIED | READY | None |

## 6. Claims Safe to Publish

- Title, problem statement, live client/API URLs.
- All 7 confirmed key features and all 5 confirmed technical decisions, as facts.
- Role names (Customer, Technician, Administrator).
- All 5 architecture layers, as named components.
- "Live" status label.
- Related-project links to Bang Learner and Note Bank.

## 7. Claims Requiring Cautious Wording

- Workflow step sequencing/gating language (Section 3) — recommend the narrative-paragraph alternative or a trimmed step list without "once X, then Y" gating claims.
- "Engineering decisions" heading and the "rather than as a single combined service" clause (Section 4) — recommend renaming to "Implementation approach" and trimming that clause.
- Role and architecture-layer *descriptions* — currently reasonable paraphrases of confirmed features; no change required, but should not be extended with further unverified detail.

## 8. Claims Requiring User Confirmation

- Exact role on Sarabo (solo vs. team, specific responsibilities).
- Team size and collaborators.
- Development timeline.
- Client and server repository URLs, and public documentation URL.
- Current project status detail (beyond "Live," which is already safe).
- 2–4 real challenges and how they were solved.
- Result or outcome.
- What would be improved next.
- Cover image and 5–10 screenshots (or confirmation none exist yet).
- Bang Learner live URL; Note Bank backend framework (Django unverified).

## 9. Claims to Omit

None identified beyond what is already correctly omitted. No business outcome, user-count, revenue, production-scale, or testimonial claim exists anywhere in the current Sarabo rendering — this was checked directly against `client/src/data/projects.js` and confirmed absent.

## 10. Featured Project Assessment

| Project | Technical depth | Frontend relevance | Completeness | Live URL | Repo | Screenshots | Case-study readiness | Recruiter value | Recommended level |
|---|---|---|---|---|---|---|---|---|---|
| Sarabo | High (multi-role, auth, payments, separate client/API) | High | Structurally complete; narrative evidence partial | Yes (client + API) | No (TODO_CONTENT) | No | Complete case study, with noted evidence gaps | High | **FLAGSHIP CASE STUDY** (confirmed) |
| Bang Learner | Moderate (auth, responsive UI, MongoDB) | High | Repository only; no verified role/timeline/challenges | No | Yes | No | Not ready | Moderate, pending evidence | **PROJECT CARD** (confirmed — do not promote yet) |
| Note Bank | Moderate (team/academic project, unverified stack detail) | Moderate | Repository only; ownership and stack partly unverified | No | Yes | No | Not ready | Moderate, pending evidence | **PROJECT CARD** (confirmed — do not promote yet) |

No project is recommended for demotion to `HIDE UNTIL READY` or `ARCHIVE ITEM` — the current "in preparation" card treatment for Bang Learner and Note Bank is already the correct, honest presentation level and matches this review's recommendation exactly. No change needed.

## 11. Recommended Project Order

Confirmed as-is: **1. Sarabo, 2. Bang Learner, 3. Note Bank.** This matches the current `client/src/data/projects.js` array order and is the correct order by evidence strength (Sarabo has a complete case study and two live URLs; Bang Learner has a repository and a fuller confirmed feature/stack list than Note Bank; Note Bank has the least-verified stack detail).

**Is a third flagship project currently strong enough?** No. Neither Bang Learner nor Note Bank has a verified role, timeline, challenge, or outcome — promoting either to a second full case study now would require inventing exactly the kind of content this project's evidence policy forbids. **Recommend: one flagship case study (Sarabo) + two honestly-labeled project cards**, not three case studies. This matches the spec's explicit guidance that two strong projects are preferable to three weak ones, and requires no implementation change — it is already the current state.

## 12. Archive Candidate Assessment

| Candidate | Classification | Reason |
|---|---|---|
| Jahid Worlds | NEEDS VERIFICATION | `CONTENT_CHECKLIST.md` lists it with presentation readiness `TODO_CONTENT`; no repo/live link recorded |
| Blood Donation Application | NEEDS VERIFICATION | Same — no readiness confirmation, no link recorded |
| Hostel Management System | NEEDS VERIFICATION | Same |
| React mini-projects (exact selection) | NEEDS VERIFICATION | Exact selection itself is undetermined per checklist |

No archive candidate is classified `READY FOR ARCHIVE` or `HIDE` — there isn't enough recorded evidence in `CONTENT_CHECKLIST.md` to make either call, and this review did not inspect any unrelated repositories to fill that gap (per scope). No change to `client/src/data/projects.js` is warranted; the Work page's empty archive group remains correct.

## 13. User Questionnaire

1. What was your exact role on Sarabo — for example, solo builder, frontend lead, or full-stack contributor? Was it solo or a team project, and if a team, how many people and what did you personally own?
2. What was the approximate development timeline (start date, launch date, or duration)?
3. What was the most difficult technical challenge you faced while building Sarabo?
4. How did you solve that challenge?
5. What is the current status of Sarabo (actively maintained, paused, feature-complete, etc.), and what result, outcome, or personal learning would you highlight?
6. Can you share the client and/or server repository URLs (even privately, so they can be verified before any public link is added)?
7. Do you have a cover image or any screenshots available for the case study, or should that remain marked as not yet available?
8. For the Workflow section: would you prefer the current six-step list (with the ordering/gating language softened) or the single-paragraph phrasing suggested in Section 3?
9. Do you approve renaming the "Engineering decisions" heading to "Implementation approach" and trimming the "rather than as a single combined service" clause, as recommended in Section 4?
10. For Bang Learner and Note Bank: do you have a live URL for Bang Learner, and can you confirm whether Note Bank's backend actually uses Django (currently unverified and not displayed)?

## 14. Recommended Next Action

Send this review's console report and the questionnaire (Section 13) to the user for answers. No further implementation is blocking — the current published Sarabo case study is honest and safe to remain live as-is. Once Q6–Q9 are answered, run a small follow-up wording pass (workflow phrasing choice, "Implementation approach" rename) and, if new facts are supplied (Q1–Q5, Q10), a content-expansion pass to fill in role, timeline, challenge, outcome, and reflection using the existing `caseStudy.challenge` / `outcome` / `reflection` fields already defined in the data model (no schema change needed).

## 15. Final Review Verdict

**B. SARABO CONTENT USABLE WITH CAUTIOUS WORDING**

Nothing published is fabricated, and the current Sarabo case study is safe to remain live. Two areas (workflow sequencing language, "Engineering decisions" heading/framing) are recommended for cautious-wording revision pending explicit user approval (Section 13, Q8–Q9), and several high-value facts remain correctly withheld pending user confirmation (Section 8). No source code was changed in this review.
