J THE MONSTER
A small, single-user–friendly workout logger I “vibe-coded” for my nephew to track gym progress.
The app focuses on fast set logging, exercise discovery, and simple progress charts.

This README is intentionally technical and minimal.

LLM-Assisted Development
I used multiple LLMs for pair-programming and refactors:

ChatGPT-5 (Thinking) — architecture, schema, UI polish

Claude Sonnet 4 — component scaffolds, copyedits

Gemini 2.5 Pro — test data generators, edge-case checks

Prompts and diffs were iterated inline; there is no toolchain dependency at runtime.

Tech Stack
Frontend

Nuxt 3 (Vue 3, Vite, TypeScript)

Pinia (state)

Tailwind CSS (utility styling)

Chart.js via vue-chartjs (progress charts)

Backend / Data

Supabase (Postgres, Auth, RLS, SQL migrations)

Row Level Security policies (read-mostly; user-scoped writes)

Tooling

ESLint + Prettier

pnpm (or npm/yarn)

Features
Exercise catalog (≈105 seeded mass-builder/popular movements across 7 body parts)

Log sets quickly by body part → exercise

Auto-suggest/typeahead when adding custom exercises (duplicate guard)

Simple progress visualization (top-set line/fill)

Flat, high-contrast UI (purple surfaces, sun-yellow accents, fire-pink CTAs)

Directory (high-level)
pgsql
Copy
Edit
.
├─ app.vue
├─ pages/
│  └─ index.vue                # landing / dashboard
├─ components/
│  └─ exercises/
│     └─ AddExerciseModal.vue  # modal + typeahead
├─ stores/
│  └─ exercises.ts             # catalog + user rows, filters, create action
├─ assets/
│  └─ css/tailwind.css         # utilities (.select, .input-shell, etc.)
├─ supabase/
│  └─ sql/seed_exercises.sql   # optional: SQL seed used in setup
└─ tailwind.config.ts
Environment
Create .env or .env.local:

bash
Copy
Edit
NUXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
Database
The app expects a single table. There are two supported layouts.

Option A (current app) — single table public.exercises
Columns

id uuid primary key default gen_random_uuid()

user_id uuid null default auth.uid() ← catalog rows use NULL

name text not null

body_part text not null (expected values: chest|triceps|back|biceps|legs|shoulders|abs)

equipment text null

created_at timestamptz not null default now()

Uniqueness

Case-insensitive per body part
create unique index uniq_exercises_name_body_part on public.exercises (lower(name), body_part);

RLS

sql
Copy
Edit
alter table public.exercises enable row level security;

-- read for everyone
drop policy if exists exercises_select_all on public.exercises;
create policy exercises_select_all on public.exercises for select using (true);

-- insert/update only own rows; catalog (NULL user_id) allowed only via SQL/seed
drop policy if exists exercises_insert_own on public.exercises;
drop policy if exists exercises_update_own on public.exercises;

create policy exercises_insert_own on public.exercises
  for insert with check (auth.uid() = user_id or user_id is null);

create policy exercises_update_own on public.exercises
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
Seed (catalog)

Either run supabase/sql/seed_exercises.sql (creates/patches + upserts), or import the CSV.

Catalog rows are inserted with user_id = NULL.

Option B (alternative) — split catalog
If you prefer isolation:

public.exercise_catalog (no user_id) for seeded rows + index (lower(name), body_part).

public.exercises for user-added rows (scoped by user_id).

Client merges catalog ∪ mine in the store. (Store already supports Option A; switching is trivial.)

Store (data flow)
stores/exercises.ts

loadAll():

Catalog: SELECT … FROM exercises WHERE user_id IS NULL

Mine: SELECT … FROM exercises WHERE user_id = auth.uid()

Merge + keep in memory

byPart(part) and search(q, part?) getters

createCustom({ name, body_part, equipment }):

Local duplicate guard (case-insensitive within body_part)

Insert via Supabase (RLS default sets user_id)

Push into store on success

Server-side uniqueness enforced by index

UI Notes
Dropdowns use .select utility (custom arrow, white text, purple surface).

Inputs use .input-shell.

Section headings use .heading-white; date uses .title-large; greeting uses .greeting.

AddExerciseModal.vue includes a dependency-free typeahead:

Scoring: prefix > word-start > contains (+0.5 if same body part)

Keyboard: ↑/↓/Enter/Esc

Highlights matched substring via <span class="mark">…</span>

Dev
bash
Copy
Edit
pnpm install         # or npm i / yarn
pnpm dev             # http://localhost:3000
pnpm build && pnpm preview
Lint/format:

bash
Copy
Edit
pnpm lint
pnpm format
Testing (lightweight)
There is no formal test suite yet. Manual checks:

Seed present: SELECT body_part, count(*) FROM public.exercises WHERE user_id IS NULL GROUP BY 1 ORDER BY 1;

Store smoke:

await useExercises().loadAll()

useExercises().byPart('back')

useExercises().search('row','back')

Security
Reads are public (catalog), writes require authenticated user via RLS.

Unique index prevents catalog duplication by case (e.g., “Bench press” vs “bench Press”).

For multi-tenant deployments, move catalog to exercise_catalog and restrict writes on that table to service-role only.

Roadmap
Set/rep logging from the list row (inline)

Session templates (push/pull/legs)

Export CSV

Per-exercise PR tracking

PWA offline cache

License
MIT. See LICENSE.

Acknowledgements
Thanks to my nephew for the motivation and to LLMs for the late-night pairing.
