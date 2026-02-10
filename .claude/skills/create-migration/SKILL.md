---
name: create-migration
description: Scaffold a new Supabase migration with auto-numbered filename and header template
user-invocable: true
disable-model-invocation: true
arguments:
  - name: name
    description: Short snake_case name for the migration (e.g. "add_user_preferences")
    required: true
---

# Create Migration

Create a new Supabase SQL migration file following project conventions.

## Steps

1. **Ensure migrations directory exists**: If `supabase/migrations/` does not exist, create it.

2. **Detect next migration number**: List files in `supabase/migrations/` and find the highest `NNN_` prefix. If no files exist, start at `001`. Increment by 1, zero-padded to 3 digits.

3. **Create the migration file** at `supabase/migrations/{number}_{name}.sql` with this template:

```sql
-- Migration: {Title Case of name}
-- Created: {YYYY-MM-DD}
-- Description: TODO - describe what this migration does
--

-- =============================================================================
-- 1. TODO - First change
-- =============================================================================


```

4. **Remind the user** of the required workflow after creating the file:

> Migration created. Remember the database change workflow:
> 1. **Migration** (done) -> `supabase/migrations/{filename}`
> 2. **Types** -> Update `lib/types.ts`
> 3. **Components** -> Update UI as needed
> 4. **RLS** -> Add RLS policies for any new tables
