# Supabase Schema Restoration Guide

## Table Usage Analysis

### 1. `module_progress` Table

**Usage in codebase:**
- **Workspace.jsx (line 39-47):** `UPDATE` with columns:
  - `completed: boolean`
  - `completed_at: timestamp`
  - `attempts: integer`
  - WHERE `student_id` = user.id AND `module_id` = moduleId

- **Dashboard.jsx (line 45-49):** `SELECT *` with `student_id` filter, ordered by `module_id`

- **ModulePage.jsx (line 49-53):** `SELECT completed` with `student_id` and `module_id` filters

**Data Types Implied:**
- `id`: UUID (primary key)
- `student_id`: UUID (foreign key to auth.users.id)
- `module_id`: integer (1-11)
- `completed`: boolean (default false)
- `completed_at`: timestamp with timezone (nullable)
- `attempts`: integer (default 0)
- `created_at`: timestamp with timezone (auto)
- `updated_at`: timestamp with timezone (auto)

**Key Observations:**
- Written to explicitly via Workspace.jsx UPDATE (not via trigger)
- The UPDATE statement suggests rows must pre-exist
- No INSERT logic found in app code
- **Action needed:** Either create rows on signup for all 11 modules, or via database trigger on auth.users

---

### 2. `diagnostic_results` Table

**Usage in codebase:**
- **Diagnostic.jsx (line 77-80):** `INSERT` with columns:
  - `student_id: UUID`
  - `module_id: integer`
  - `correct_count: integer`
  - `total_count: integer`
  - `knows_concept: boolean`

- **DiagnosticGate.jsx (line 20-23):** `SELECT id` with `student_id` filter, LIMIT 1

- **progress.js (line 21-25):** `SELECT module_id, knows_concept` with `student_id` filter

**Data Types Implied:**
- `id`: UUID (primary key)
- `student_id`: UUID (foreign key to auth.users.id)
- `module_id`: integer (1-10, NOT 11; capstone is not assessed)
- `correct_count`: integer (0-2, always 2 questions per module)
- `total_count`: integer (always 2)
- `knows_concept`: boolean (true if correct_count === total_count)
- `created_at`: timestamp with timezone (auto)
- `updated_at`: timestamp with timezone (auto)

**Key Observations:**
- Written to explicitly from Diagnostic.jsx (after quiz submission)
- Only modules 1-10 have diagnostic questions
- One row per student per module (composite unique constraint)
- Called by DiagnosticGate to check if student completed diagnostic

---

## SQL to Restore Schema

Run these commands in the Supabase SQL editor in order:

### Step 1: Create `module_progress` table

```sql
CREATE TABLE public.module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL CHECK (module_id >= 1 AND module_id <= 11),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

CREATE INDEX idx_module_progress_student_id ON public.module_progress(student_id);
CREATE INDEX idx_module_progress_module_id ON public.module_progress(module_id);
```

### Step 2: Create `diagnostic_results` table

```sql
CREATE TABLE public.diagnostic_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL CHECK (module_id >= 1 AND module_id <= 10),
  correct_count INTEGER NOT NULL CHECK (correct_count >= 0 AND correct_count <= 2),
  total_count INTEGER NOT NULL DEFAULT 2 CHECK (total_count = 2),
  knows_concept BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

CREATE INDEX idx_diagnostic_results_student_id ON public.diagnostic_results(student_id);
CREATE INDEX idx_diagnostic_results_module_id ON public.diagnostic_results(module_id);
```

### Step 3: Enable RLS on both tables

```sql
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;
```

### Step 4: Create RLS policies for `module_progress`

```sql
-- Students can only see their own module progress
CREATE POLICY "Users can view their own module_progress" 
  ON public.module_progress
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can update their own module progress (marks completion)
CREATE POLICY "Users can update their own module_progress" 
  ON public.module_progress
  FOR UPDATE
  USING (auth.uid() = student_id);

-- System/app creates rows (via trigger or explicit insert)
CREATE POLICY "Module progress can be inserted" 
  ON public.module_progress
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);
```

### Step 5: Create RLS policies for `diagnostic_results`

```sql
-- Students can only see their own diagnostic results
CREATE POLICY "Users can view their own diagnostic_results" 
  ON public.diagnostic_results
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own diagnostic results (after completing quiz)
CREATE POLICY "Users can insert their own diagnostic_results" 
  ON public.diagnostic_results
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);
```

### Step 6: (Optional) Create trigger to initialize module_progress on signup

This automatically creates rows for all 11 modules when a new user signs up:

```sql
CREATE FUNCTION public.initialize_module_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a row for each module (1-11) for the new user
  INSERT INTO public.module_progress (student_id, module_id, completed)
  SELECT NEW.id, generate_series(1, 11), FALSE
  ON CONFLICT (student_id, module_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_module_progress();
```

---

## Summary of Missing Tables

| Table | Purpose | Rows per student | Writes via |
|-------|---------|------------------|-----------|
| `module_progress` | Tracks module completion, attempts, timestamp | 11 (one per module 1-11) | Workspace.jsx UPDATE |
| `diagnostic_results` | Stores quiz results and concept mastery | ≤10 (one per module 1-10 if taken) | Diagnostic.jsx INSERT |

---

## Notes

1. **No profiles table found** — The app uses `auth.users` with `user_metadata.full_name` (set during signup)

2. **module_progress initialization** — Two options:
   - Use the trigger above (automatic on signup)
   - Create rows explicitly in Signup.jsx (requires code change)

3. **RLS Policies** — All policies are set to `SECURITY DEFINER` to allow the app to write data while maintaining user isolation

4. **Cascading deletes** — When a user is deleted from auth.users, all their progress and diagnostic results are automatically deleted

---

## Testing After Restoration

After running the SQL:

1. **Sign up a new user** → Check if 11 rows appear in `module_progress` (if using trigger)
2. **Take the diagnostic quiz** → Check if 10 rows appear in `diagnostic_results` (modules 1-10)
3. **Complete a module** → Check if `completed` and `completed_at` update in `module_progress`
4. **View Dashboard** → Verify progress bar and module statuses render correctly
