# Creative Refactor And Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Creative page into typed, maintainable pieces and finish the missing quick actions for copy editing, saving, and image prompt generation.

**Architecture:** Keep `src/app/creative/page.tsx` as the client-side coordinator. Move data shapes and defaults into `types.ts` and `constants.ts`, pure formatting/storage helpers into `creative-utils.ts`, and UI sections into focused components under `src/app/creative/components`. Server Actions remain in `src/app/actions/creative.ts`.

**Tech Stack:** Next.js 16 App Router, React 19 client components, TypeScript, CSS modules, existing Server Actions.

---

### Task 1: Types, Constants, And Helpers

**Files:**
- Create: `src/app/creative/types.ts`
- Create: `src/app/creative/constants.ts`
- Create: `src/app/creative/creative-utils.ts`

- [ ] Define typed interfaces for generated copy variants, competitor ads, competitor analysis, counter ads, saved creative items, and toast messages.
- [ ] Move default form values, framework options, tone options, and saved competitors into constants.
- [ ] Add helper functions for combining ad copy, generating an image prompt from copy, creating a saved creative item, and reading/writing local library JSON defensively.

### Task 2: Component Split

**Files:**
- Create: `src/app/creative/components/Toast.tsx`
- Create: `src/app/creative/components/CopywritingForm.tsx`
- Create: `src/app/creative/components/CompetitorForm.tsx`
- Create: `src/app/creative/components/CopyResults.tsx`
- Create: `src/app/creative/components/CompetitorResults.tsx`
- Create: `src/app/creative/components/AdPreviewModal.tsx`
- Create: `src/app/creative/components/CreativeLibrary.tsx`

- [ ] Move form rendering into separate components with explicit props.
- [ ] Move copy result cards into an editable component supporting copy, delete, save, and image prompt copy.
- [ ] Move competitor analysis output and modal preview into focused components.
- [ ] Add a small saved library section driven by local state.

### Task 3: Page Coordinator

**Files:**
- Modify: `src/app/creative/page.tsx`

- [ ] Replace the monolithic page with state orchestration and handlers only.
- [ ] Load accounts through existing dashboard action.
- [ ] Load and persist saved creatives through localStorage helpers.
- [ ] Preserve current generation, competitor analysis, counter-ad, tab, refresh, and modal behavior.

### Task 4: Server Action Text And CSS Cleanup

**Files:**
- Modify: `src/app/actions/creative.ts`
- Modify: `src/app/creative/creative.module.css`

- [ ] Fix user-facing Vietnamese text and TypeScript return shapes in creative actions.
- [ ] Repair invalid CSS in the responsive block.
- [ ] Add CSS classes needed by the new components and remove reliance on large inline style blocks where practical.

### Task 5: Verification

**Files:**
- Verify all modified files.

- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.
- [ ] If verification fails, fix the concrete failures and rerun the failed command.
