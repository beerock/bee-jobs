# CLAUDE.md

## Project Overview

**bee-jobs** is a personal job tracking CRM with a Kanban board interface. Jobs flow through stages (Saved -> Applied -> Interviewing -> Offer -> Passed). Jobs are added manually through the UI or automatically via the BeeBot API endpoint.

**Tech Stack:** Next.js 16, TypeScript 5.7, Tailwind CSS 3, Supabase (Auth + Postgres + RLS via @supabase/ssr), lucide-react (icons), Vercel


---

## Project Structure

```
app/layout.tsx        -> Root layout (metadata, viewport, global CSS)
app/page.tsx          -> Auth gate (redirects to /dashboard or /login)
app/login/            -> Email/password login (client-side Supabase auth)
app/dashboard/        -> Main Kanban board (server component, auth-protected)
app/api/jobs/         -> BeeBot REST API (service role, Bearer token auth)
components/           -> JobBoard, JobCard, JobDetailModal, AddJobModal, Header
lib/supabase/         -> client.ts (browser), server.ts (server components)
lib/types.ts          -> Job, Contact, Activity types + STATUS_CONFIG
supabase/schema.sql   -> Full schema with RLS policies
```

---

## Critical Gotchas

- **No server actions**: All UI mutations go through client-side Supabase (RLS-protected). There is no `app/actions/` directory.
- **No middleware**: No `middleware.ts` exists. Session refresh relies on Supabase SSR cookie handling, not middleware interception.
- **BeeBot API uses service role**: `app/api/jobs/route.ts` creates an admin Supabase client with `SUPABASE_SERVICE_ROLE_KEY` that bypasses RLS. Changes to this file require security review.
- **Single-user assumption**: The BeeBot API picks the first user from `auth.admin.listUsers()`. This breaks if multiple users exist.
- **No migrations directory**: Database schema is in `supabase/schema.sql` (single file). Use `/create-migration <name>` to start using incremental migrations in `supabase/migrations/`.
- **No tests**: No test runner, test files, or test command configured. Do not attempt to run tests.
- **Session staleness without middleware**: `lib/supabase/server.ts` silently swallows cookie-set errors with a comment suggesting middleware handles refresh -- but there is no middleware. Server component auth checks may use stale sessions.
- **API PATCH/DELETE not scoped to user**: The PATCH and DELETE handlers in `app/api/jobs/route.ts` operate on any job by `id` without verifying user ownership. Combined with service role (RLS bypass), anyone with the API key can modify/delete any user's jobs. Currently mitigated by the single-user assumption.

---

## Workflows & Rules

### Git Worktree Safety (CRITICAL)

**At the start of EVERY new session**, before making any file changes:

1. **Detect environment** using `git worktree list` and `git branch --show-current`

2. **If on `main` in the main repo:**
   - STOP and alert the user
   - Show existing worktrees: `git worktree list`
   - Ask: "Do you need a worktree for this task, or is a branch sufficient?"
     - **Worktree:** Run auto-setup (below), continue in same session with absolute paths
     - **Branch only:** `git checkout -b <branch>` for lightweight tasks
     - **Main (emergency only):** Requires explicit confirmation

3. **If in a worktree:** Show branch, ask to continue or switch

4. **Once confirmed:** Proceed without re-prompting

**Worktree Auto-Setup:**
```bash
MAIN_REPO=$(pwd)
git worktree add ../bee-jobs-worktrees/<branch> -b <branch>
cd ../bee-jobs-worktrees/<branch>
npm install
cp "$MAIN_REPO/.env.local" .env.local
```

**Cleanup** (after merging, from main repo):
```bash
git worktree remove ../bee-jobs-worktrees/<branch>
git branch -d <branch>
```

### Always Do
- Validate auth in server components before rendering protected data
- Use RLS policies for all new tables
- Include `user_id` foreign key and RLS policy for any new table
- Use `router.refresh()` after client-side Supabase mutations to sync server state
- Use optimistic updates with rollback on error for client-side mutations (see JobBoard.tsx pattern)

### Never Do
- Import `SUPABASE_SERVICE_ROLE_KEY` or service role client in client components
- Use raw HTML injection with user-supplied content
- Skip auth checks in server components or API routes
- Edit `.env` files directly (blocked by PreToolUse hook)
- Edit lock files directly (blocked by PreToolUse hook)

### Code Change Workflows

**Database Changes:**
1. Migration -> `supabase/migrations/` (use `/create-migration <name>`)
2. Types -> `lib/types.ts`
3. Components -> `components/` or `app/`

**New API Endpoint:**
1. Create route in `app/api/`
2. Validate Bearer token auth
3. Use service role client only if RLS bypass is needed (and document why)
4. Add to security reviewer scope

---

## Quick Reference

### Dev Commands
```bash
npm run dev                     # Start dev server (localhost:3000)
npm run build                   # Production build
npm run lint                    # ESLint check (next lint)
npx tsc --noEmit                # TypeScript type check
```

### Required Env Vars
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
BEEBOT_API_KEY
```

See `.env.example` for full template.

---

*Last Updated: February 10, 2026*
