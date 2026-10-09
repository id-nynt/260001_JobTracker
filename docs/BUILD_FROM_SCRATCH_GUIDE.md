# Build a portfolio-grade web app from scratch

A beginner's guide, using this project (a job application tracker) as the running example. You will go from "I have an idea" to "a deployed app I can show in an interview", in the order professionals work: **understand → specify → design → build in small slices → test → deploy → present**.

**Who this is for:** someone who can write basic code but has never shipped a full-stack app.
**Time:** about 3–5 weeks part-time. The numbers next to each stage are rough hours.
**How to read it:** every step has **Goal**, **Do**, **Done when** (a check you can run) and, where it matters, **Pitfall** (a mistake this project actually made).

```
 1 Requirements ─> 2 Spec ─> 3 Design ─> 4 Setup ─> 5 Backend ─> 6 Frontend ─> 7 Quality ─> 8 Deploy ─> 9 Present
   (what/why)      (contract)  (how)      (tools)    (API+DB)     (UI)          (tests,CI)    (live)      (portfolio)
```

---

## 0. Before you start

### Principles that save weeks

1. **Thin vertical slices.** Build one feature through *all* layers (database → API → UI → test) before starting the next. Never build "all the database" then "all the UI". A working small thing beats a half-built big thing.
2. **Decide the hard things first.** Security (who can see what) and data ownership are cheap on day 1 and very expensive on day 30. This project added "which user owns this row" late and had to rework it.
3. **Make it work, make it right, make it fast, in that order.**
4. **Every bug becomes a test.** Write the failing test first when you can.
5. **Commit small, often, with meaningful messages.** `fix: send group id as a number` beats `Update`.
6. **Never commit secrets.** Passwords, API keys and signing keys live in environment variables, never in git (git remembers forever).

### Tools to install (about 1 hour)

| Tool | Why |
| --- | --- |
| Git + a GitHub account | version control, CI, hosting links |
| VS Code (+ C# Dev Kit, ESLint, Tailwind CSS IntelliSense) | editor |
| Node.js 20 LTS | frontend tooling |
| .NET 8 SDK | backend |
| Docker Desktop | run PostgreSQL locally, build the deployable image |
| A REST client (the Swagger page your API generates is enough) | try the API by hand |

Free accounts you will need later: Neon (database), Render (API), Vercel (frontend).

### Choosing a stack

Pick **one boring, popular stack** and finish. This project: React + Vite + Tailwind / ASP.NET Core / PostgreSQL. Any similar stack works (Node + Express, Django, Spring). What matters is that you can explain *why*. Section 3 shows how to record that.

---

## 1. Gather information and requirements (≈3 h)

**Goal:** know what problem you solve, for whom, and what "done" means, before writing code.

### Do

1. **Pick a real problem you understand.** Ideally you are the user. Example: *"I apply to many jobs and lose track of which ones replied."*
2. **Look at 3–5 existing solutions** (spreadsheets, Trello boards, Huntr, Teal). Write one line each: what they do well, what annoys you. This shows what to copy and where you can be simpler.
3. **Write the problem statement** in 2–3 sentences:
   > Job seekers apply to dozens of roles at once. A spreadsheet gets messy and doesn't show progress. This app keeps every application in one place, shows its status, and reveals how many get replies.
4. **Describe your users.** One or two short personas. Example: *"Mai, final-year student, applying to 30 graduate roles in two waves (data roles, software roles). Uses a phone and a laptop."*
5. **List user stories** in the form *"As a …, I want …, so that …"*:
   - As a job seeker, I want to add an application (company, title, date, link, notes) so that I don't lose it.
   - … I want to set its status (Applied, Interviewing, Offered, Accepted, Rejected) so that I see progress.
   - … I want to group applications by job search (e.g. "2026_Data") so that separate searches don't mix.
   - … I want my data private to my account so that nobody else sees it.
   - … I want to see my reply rate so that I know whether my CV is working.
   - As a recruiter reviewing the portfolio, I want to try the app without signing up so that I can judge it in a minute.
6. **Prioritise with MoSCoW** so scope can't explode:
   | Must | Should | Could | Won't (this version) |
   | --- | --- | --- | --- |
   | accounts, CRUD jobs, statuses, groups, privacy | stats, demo mode, dark mode | search, CSV export | reminders, email integration, mobile app |
7. **Write non-goals and constraints.** Free hosting only. One developer. Four weeks. This keeps decisions honest.
8. **Define success criteria** you can check: *"A new user registers, adds a job and sees it after a refresh in under 2 minutes; user B can never see user A's jobs; the app is live at a public URL."*

**Done when:** one page with problem, users, prioritised stories, non-goals and success criteria. Show it to a friend; if they can't explain back what you're building, simplify.

**Pitfall:** adding features before the "Must" list works end-to-end. A finished small app is worth more than an ambitious broken one.

---

## 2. Write the spec (≈4 h)

**Goal:** a short document precise enough that you (or anyone) could build and test the app from it. This is also what you'll use as a test checklist.

### Do: use this template

```markdown
# Spec: <name>
## 1. Scope            (Must / Should / Could / Won't from step 1)
## 2. Roles            (anonymous, signed-in user, [admin])
## 3. Features with acceptance criteria
## 4. Data model       (entities, fields, rules)
## 5. API contract     (endpoint, input, output, errors)
## 6. Non-functional   (security, performance, accessibility, browsers)
## 7. Out of scope & open questions
```

### Acceptance criteria: the heart of a spec

Write them as checkable *Given / When / Then* statements. Each one later becomes a test or a manual check.

> **Feature: add an application**
> - Given I am signed in, when I submit company "Acme" and title "Developer", then it appears in my Default group with status *Applied*.
> - When the company is empty, then I see "Company name cannot be empty" and nothing is saved.
> - When the date is in the future, then it is rejected.
>
> **Feature: privacy**
> - Given user A has a job, when user B requests it by id, then B gets *404 Not Found*, and A's job is unchanged.
>
> **Feature: delete a group**
> - When I delete a group, its jobs move to my Default group (nothing is lost). The Default group cannot be deleted or renamed.

### Data model rules (examples)

- A `Job` belongs to exactly one `User` and one `Period` (group). Statuses: Applied, Interviewing, Offered, Accepted, Rejected.
- Group names are unique **per user**, not globally.
- Passwords are stored only as hashes. Emails are case-insensitive.

### Non-functional requirements (people forget these)

Security (hashed passwords, token expiry, per-user data, no secrets in git) · Reliability (clear error messages, no data loss on failed save) · Accessibility (keyboard usable, labelled fields) · Performance (list loads < 1 s for 500 jobs) · Browser support (latest Chrome/Firefox/Safari, phone width).

**Done when:** every "Must" story has at least two acceptance criteria, including one *unhappy path* (invalid input, not allowed, server down).

**Pitfall:** specs that only describe the happy path. Most real bugs live in the unhappy paths.

---

## 3. Design (≈8 h)

Design is *deciding before typing*. You'll produce: an architecture, a data model, an API design, UX flows and wireframes, a security design, a test strategy, and a short log of decisions.

### 3.1 Architecture

**Goal:** choose the pieces and how they talk.

```
Browser (React SPA) ──HTTPS + JWT──> API (ASP.NET Core) ──SQL──> PostgreSQL
```

- **Frontend and backend as separate deployables** (a SPA + an API) gives you two skills to show, and mirrors most real teams.
- **Layers inside the API:** *Controllers* (HTTP only: parse request, return status code) → *Domain/Services* (rules) → *Data* (EF Core). Keep rules out of controllers so you can test them without HTTP.
- **Stateless auth with JWT:** the server doesn't keep sessions; the token says who you are.

Draw it (boxes and arrows on paper or in Mermaid). Add every external thing: database, hosting, CI.

### 3.2 Decision log (ADR-lite)

For every non-obvious choice write 4 lines. This becomes your interview ammunition.

```markdown
### Decision: PostgreSQL instead of SQLite
Context: SQLite is zero-setup, but free hosts have ephemeral disks, so data would vanish on redeploy.
Decision: PostgreSQL (Docker locally, Neon in production).
Consequences: need Docker locally; migrations are portable; closer to what employers use.
```

Other decisions worth logging in this project: *404 instead of 403 for other users' data; demo mode as a second implementation of the same interface; stats computed in the browser; in-memory SQLite for tests.*

### 3.3 Data model

Entities and relationships (an ERD on paper is enough):

```
User 1───* Period (group) 1───* JobApplication
 │                                   ▲
 └───────────────────────────────────┘   (a job also stores its owner's UserId)
```

Design rules to decide now:
- **Ownership:** every owned table has `UserId`, and *every query filters by it*. (Day 1, not later.)
- **IDs, timestamps** (`CreatedAt`, `UpdatedAt`), **constraints** (unique email, unique `(UserId, Name)`), **max lengths**.
- Store dates as **UTC**.

### 3.4 API design

REST conventions:

| Action | Method + path | Success | Typical errors |
| --- | --- | --- | --- |
| list | `GET /api/jobs` | 200 | 401 |
| create | `POST /api/jobs` | 201 + body | 400 invalid, 401 |
| read one | `GET /api/jobs/{id}` | 200 | 404 (also for someone else's) |
| update | `PUT /api/jobs/{id}` | 200 | 400, 404 |
| delete | `DELETE /api/jobs/{id}` | 204 | 404 |

Decide one **error format** for everything (this project uses RFC 7807 *ProblemDetails*: `{ "title", "status", "detail" }`) so the frontend has one way to show errors. Version or document it with Swagger.

### 3.5 UX / UI design

1. **User flows** (what path does a user take?): *Land → try demo or register → empty dashboard → add first job → see it in the list → change status → check overview.*
2. **Wireframes** on paper first (boxes only, no colours). Example dashboard:

```
┌────────────────────────────────────────────────────────────┐
│ Job Application Tracker                 user  ☀/🌙  Logout  │
├────────────────────────────────────────────────────────────┤
│ Overview  [All groups ▾]                                    │
│ [Applications 10] [Response 60%] [Interview 40%] [Offer 20%]│
│ ▂▃▅▇ applications per week                                  │
├───────────────────────────┬────────────────────────────────┤
│ Add new application       │ Applications        [+ New group]│
│ Company*  [          ]    │ ▾ 2026_Data (5)                │
│ Title*    [          ]    │    ┌ Google · Applied ─────✎ 🗑┐ │
│ Status ▾  Group ▾  Date   │    └───────────────────────────┘│
│ Notes     [          ]    │ ▸ 2026_Software (5)            │
│ [ Add application ]       │ ▸ Default (0)                  │
└───────────────────────────┴────────────────────────────────┘
```

3. **Design the states, not just the happy screen.** Every screen needs: *loading, empty, error, success*. Example empty state: "No applications yet. Add your first one on the left."
4. **Consistency:** pick a few colours, one font, a spacing scale (Tailwind gives you this). Status colours carry meaning: blue = applied, yellow = interviewing, teal = offered, green = accepted, red = rejected. **Never use colour alone**: always show the status text too.
5. **Accessibility basics from the start:** every input has a `<label>`; icon-only buttons have `aria-label`; everything works with the keyboard; contrast is readable in both themes; layout works at 360 px wide.
6. **Component tree** (frontend): `App → Routes → (Login | Register | Dashboard → StatsPanel, JobForm, GroupCard → JobCard)`.

### 3.6 Security design (30 minutes that prevent disasters)

Walk through "what could a bad user do?":

| Threat | Defence |
| --- | --- |
| Read/modify another user's data | `UserId` filter on every query; tests for it |
| Stolen database | hash passwords (BCrypt), never store plain text |
| Forged login token | strong secret from environment; validate signature, issuer, expiry |
| Password guessing | rate-limit login; minimum password length |
| Other websites calling your API from a victim's browser | CORS allow-list of your own frontend origin |
| Secrets in git | environment variables; fail at startup if missing |
| Bad input | validate on the server (never trust the browser) |

### 3.7 Test strategy

Aim for a **few valuable tests, not many cheap ones**. Test *behaviour that would hurt if broken*:

| Level | Test | Skip |
| --- | --- | --- |
| Domain | validation rules, calculations (e.g. rates) | getters/setters |
| API (integration, in memory) | auth, **privacy between users**, create/update/delete rules | one test per trivial endpoint |
| UI | forms keep input on failure, login shows the server error | snapshot tests of markup |
| Manual | the smoke test in the deployment guide | |

**The mutation check:** after writing a test, break the code on purpose; the test must fail. If it doesn't, the test is decoration.

**Done when (Design):** you have an architecture diagram, ERD, endpoint table, wireframes with states, threat table, test strategy and 3+ logged decisions. Total: 3–5 pages. It will change a little, and that's fine.

---

## 4. Project setup (≈2 h)

**Goal:** a repo where the first commit already follows good habits.

### Do

1. **Repository layout** (monorepo keeps it simple):
   ```
   my-app/
     api/            backend project
     api.Tests/      backend tests (a *sibling* folder, not inside api/)
     web/            frontend
     docs/           spec, design, decisions, deployment guide
     .github/workflows/ci.yml
     README.md  LICENSE  .gitignore
   ```
2. **`.gitignore` first**, before you create anything: `bin/ obj/ node_modules/ dist/ .env .env.local *.db`. Do this *before* the first commit, because files committed once live in history forever.
3. **Git workflow:** `main` always works. Do each piece of work on a branch (`feat/auth`), commit in small steps, merge via pull request (even alone; it builds a visible history).
4. **Commit message format** (Conventional Commits): `feat: …`, `fix: …`, `test: …`, `docs: …`, `chore: …`, `refactor: …`. Write what and why in one line.
5. **Secrets policy:** `.env.example` documents variables *without values*; real values live in `.env.local` (ignored), `dotnet user-secrets`, or the host's dashboard.
6. **Local database** with one command:
   ```bash
   docker run -d --name appdb -e POSTGRES_DB=app -e POSTGRES_USER=app -e POSTGRES_PASSWORD=app -p 5432:5432 postgres:16
   ```
   (If port 5432 is busy because another Postgres runs on your machine, map another port such as `-p 55432:5432`.)

**Done when:** `git status` is clean, `.gitignore` works, README has a one-line description and the repo is on GitHub.

---

## 5. Build the backend, slice by slice (≈20–25 h)

For each slice: build it, **test it**, commit it. Don't move on while the previous slice is broken.

### Slice 5.1: Skeleton, health check, Swagger

**Do:** `dotnet new webapi` → remove the sample → add `app.MapHealthChecks("/health")` and Swagger.
**Done when:** `GET /health` returns `Healthy`, `/swagger` loads.

### Slice 5.2: Database and migrations

**Do:** add EF Core + Npgsql; create `DbContext`; model `User`; `dotnet ef migrations add InitialCreate`; apply migrations on startup.
**Concepts:** *migration* = a versioned script that evolves the database schema along with your code; never hand-edit a deployed database.
**Done when:** starting the API creates the tables in Docker Postgres (check with any DB viewer).

### Slice 5.3: Accounts (register, login)

**Do:**
1. `POST /api/auth/register`: validate input (data annotations), normalise email to lowercase, reject duplicates, **hash with BCrypt**, save, return a token.
2. `POST /api/auth/login`: same error message for "unknown user" and "wrong password" (don't reveal which accounts exist).
3. Token creation in one service class. The signing secret comes from configuration and **the app refuses to start without it**.
4. Rate-limit both endpoints.
**Test:** register → token works on a protected endpoint; duplicate email in different casing is rejected; wrong password → 401; forged and expired tokens → 401.
**Pitfall:** a default secret "just for development" in code. People forget to change it; anyone reading your repo can forge tokens.

### Slice 5.4: Ownership: do this *before* any other table

**Do:**
1. Helper `User.GetUserId()` reading the `sub` claim.
2. Rule for every controller: *every query starts with `.Where(x => x.UserId == userId)`*, and loading by id means `x.Id == id && x.UserId == userId`.
   ```csharp
   var job = await _context.JobApplications
       .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);   // never FindAsync(id)
   if (job == null) return NotFound();                                // someone else's = "doesn't exist"
   ```
**Pitfall (this project's biggest flaw):** the first version had login but no `UserId` on jobs, so every user saw everyone's data. Login ≠ authorization. Write the isolation test the day you create the first owned table.

### Slice 5.5: Groups ("periods") CRUD

**Do:** create/list/rename/delete; unique name per user; each user gets a *Default* group at registration; deleting a group moves its jobs to Default; Default can't be deleted or renamed. Return the job **count** and **date range** with each group (compute them in the query: a projection with `Count`, not by loading all jobs).
**Test:** the rules above, plus "counts and dates stay correct when jobs move or are deleted".
**Pitfall:** forgetting to refresh derived values (date range) after delete: stale data is a classic bug.

### Slice 5.6: Job applications CRUD

**Do:**
1. Put validation **inside the entity** (a `Create(...)` factory and `Update…` methods that throw a `DomainException`): trim text, reject empty company/title, reject future dates, normalise dates to UTC.
2. Controllers stay thin. Partial update: omitted fields unchanged; empty string clears optional fields.
3. When a job is created or moved, check the target group belongs to the same user.
**Test:** defaults, invalid input rejected with a readable message, partial updates, cannot put a job in someone else's group.

### Slice 5.7: Uniform errors

**Do:** register `AddProblemDetails` + an exception handler mapping `DomainException` → 400, anything unexpected → 500 with no internals leaked. Customise model-validation errors to put the first message in `detail`. Remove per-action `try/catch`.
**Done when:** every failure the frontend can see has the same shape.

### Slice 5.8: Hardening before you call the backend "done"

CORS allow-list from config · restricted logging of secrets (never log passwords/tokens) · migrations on startup · `/health` · a **Dockerfile** that runs as a non-root user.

### Backend tests (write along the way, not at the end)

- Project in a sibling folder, with `WebApplicationFactory<Program>` so tests start the *real* API in memory (swap only the database for in-memory SQLite).
- Helper: `TestUser.RegisterAsync()` returns a signed-in client with a random username, so tests don't interfere.
- **Headline tests: user B cannot list, read, update or delete user A's data, and A's data is unchanged afterwards.**
- Run the mutation check on those.

---

## 6. Build the frontend, slice by slice (≈20–25 h)

### Slice 6.1: Scaffold

**Do:** `npm create vite@latest` (React) → add Tailwind → React Router → Axios → ESLint → Vitest. Add the Vite dev **proxy** (`/api` → `http://localhost:5000`) so you avoid CORS in development.
**Done when:** the dev server shows a page; `npm run lint`, `npm test`, `npm run build` all run.

### Slice 6.2: The API layer (do this properly once)

Create **one** place that talks to the server:
- `client.js`: one Axios instance, adds the token header, handles `401` (clear session, go to login), and a `getErrorMessage(error)` that turns any failure into text for humans ("Can't reach the server…").
- `httpApi.js`: functions like `jobs.list()`, `jobs.create(job)`. **They never swallow errors.**
**Pitfall (this project's worst frontend bug):** every call did `.catch(() => useMockData())`. A wrong password "worked" because the failure silently fell back to fake data. Rule: *a failed request must reach the user.*

### Slice 6.3: Sign in / sign up / protected pages

**Do:** `Login`, `Register` pages; session in `localStorage` (`{token, user}`); `ProtectedRoute` redirecting to `/login`; logout clears the session; show server messages ("Invalid email/username or password").
**Test:** wrong password shows the message and doesn't navigate; success stores the session and opens the dashboard.
**Note:** `localStorage` tokens can be read by injected scripts; for a larger product use an `httpOnly` cookie. Mention this trade-off in your README.

### Slice 6.4: The dashboard, one feature at a time

1. **List** groups and jobs (loading state, empty state, error banner).
2. **Add a job** (controlled form, required fields, keep what the user typed if saving fails, clear it on success).
3. **Edit / delete a job** (inline edit, confirm before delete).
4. **Groups**: create, rename (double-click), delete, count badge.
5. After each change: reload the data (simple and correct) instead of hand-patching local state in several places.

**Pitfalls seen here:**
- `<select>` values are **strings**; your ids are **numbers**. `"2" === 2` is false, so the moved job matched no group and disappeared. Convert on change: `Number(value)`.
- A "loading" flag that wipes the page on every refresh destroys the user's typing. Show loading only for the first load.
- `null` from the API into `value={…}` makes React warn; use `value={x ?? ''}`.

### Slice 6.5: Feedback and polish

Toast messages instead of `alert()`; labels on every field; `aria-label` on icon buttons; header is keyboard-operable (`role="button"`, `tabIndex`, `aria-expanded`); dark/light theme remembered in `localStorage`; test at phone width.

### Slice 6.6: A feature that shows thinking: statistics

Write a **pure function** `computeStats(jobs)` (no UI, no network). Decide the definitions and write them down: *response rate = applications that got any reply, including rejection ÷ all applications*; return `null` (not 0 or NaN) when there is nothing to divide. Test the maths, including week boundaries. Then a small panel renders it.

### Slice 6.7: Demo mode (so a recruiter can try it in one click)

Define one interface (`auth`, `jobs`, `groups`) with two implementations: the real one (HTTP) and a demo one (localStorage, sample data) that **follows the same rules** (default group, unique names, calculated counts). A `mode` stored in the session picks which one is used. The demo is an explicit choice ("Try the demo"), never an automatic fallback.

### Frontend tests

Test behaviour a user would notice: the form sends a numeric group id and keeps input on failure; login shows the server error and doesn't navigate; the demo store enforces the same rules; error messages are readable. Use Testing Library (query by label/role, like a user), not by CSS class. Mutation-check them.

---

## 7. Quality gates (≈4 h)

1. **Lint** (ESLint) and **format** consistently.
2. **CI** (GitHub Actions): on every push and pull request run backend tests, frontend lint + tests + build. Add the badge to the README. Protect `main` so a red build can't be merged.
3. **Manual smoke test** (write it down once, run it before each release): demo works; register; add/move/delete a job; refresh keeps data; wrong password message; second user can't see the first user's data; mobile width; keyboard-only pass through the form.
4. **Accessibility check:** browser Lighthouse (aim ≥ 90), tab through every page.
5. **Security self-review** using the table in 3.6. Search the repo for secrets (`git grep -i "secret\|password"`).
6. **Dependency hygiene:** `npm audit` and `dotnet list package --vulnerable`; don't chase every warning, fix serious ones.

---

## 8. Deployment (≈4 h)

Follow [DEPLOYMENT.md](DEPLOYMENT.md) for exact clicks. The shape:

1. **Database:** create a hosted PostgreSQL (Neon). Copy its connection string.
2. **API:** build a Docker image; deploy to a host (Render). Set **environment variables**: connection string, JWT secret (long and random), allowed CORS origin. Health check path `/health`.
3. **Frontend:** deploy to Vercel with root directory `web/`, set `VITE_API_URL` to the API URL (it's baked in at *build* time), add an SPA rewrite so refreshing `/dashboard` doesn't 404.
4. **Connect:** put the Vercel URL into the API's CORS setting; redeploy.
5. **Smoke test** the live URLs with the checklist in section 7.
6. **Know the free-tier limits** (the API sleeps; first request is slow) and design around them: wake it early, explain the wait, keep a demo mode that needs no API.

**Environments:** *local* (Docker DB, dev servers), *CI* (tests), *production*. Same code, different configuration, never different secrets in the repo.

---

## 9. Present it as a portfolio piece (≈4 h)

1. **README in the order a busy recruiter reads:** one-line pitch + badges → live demo link → GIF/screenshot → highlights (5 bullets) → architecture diagram → how to run → design decisions & trade-offs → roadmap.
2. **A 10-second GIF:** add a job → change status → the overview updates.
3. **A "Decisions and trade-offs" section.** This is what interviewers ask about. Be honest about limits ("tokens in localStorage; next step: httpOnly cookie").
4. **Clean commit history** and merged pull requests.
5. **Practise the story**: *Problem → what I built → the hardest bug and how I found it → what I'd do next.* Good hard-bug stories from this project: (a) users could see each other's data because login isn't authorization; (b) a silent fallback made a wrong password succeed; (c) a string/number mismatch made jobs vanish.
6. **Link everything**: pin the repo on your GitHub profile, put the live link on your CV.

### Questions you should be able to answer

- Walk me through the architecture. · How do you stop one user seeing another's data? · Why 404 and not 403? · How is the password stored? · What happens if the API is down? · How do you know it works? (tests + CI) · What would you do with more time?

---

## Appendix A: Lessons from this project's first version

| Mistake | Better practice |
| --- | --- |
| Login without per-user data ownership | Add `UserId` to every owned table on day 1; isolation tests |
| Every API failure silently replaced by fake data | Explicit demo mode; errors always reach the user |
| `<select>` value used as a number | Convert types at the boundary; regression test |
| JWT secret default in code, DB file committed | Secrets in env vars; fail fast without them; `.gitignore` before first commit |
| No tests, 7 commits all named "Update" | Tests with each slice; Conventional Commits; PRs |
| Three copies of the same HTTP client | One client module |
| Docs that described features that no longer worked | Update docs in the same commit as behaviour |
| Test project placed inside the API folder (would have been compiled into the API) | Sibling `Api.Tests` project |
| `console.log` everywhere, `alert()` for errors | Remove logs; toast component |
| Deploying "later" | Deploy a walking skeleton in week 1 so surprises appear early |

## Appendix B: A 4-week plan

| Week | Focus |
| --- | --- |
| 1 | Sections 1–4. **Deploy an empty "hello" API + frontend** so the pipeline is proven. Start slices 5.1–5.3 |
| 2 | Backend 5.4–5.8 with tests |
| 3 | Frontend 6.1–6.5 with tests |
| 4 | 6.6–6.7, CI, deploy, README, demo GIF, practise the story |

## Appendix C: Definition of done for the whole project

- [ ] Every "Must" story's acceptance criteria pass (automatically where possible)
- [ ] User A can never read or change user B's data (tested)
- [ ] No secrets in git; app fails to start without required secrets
- [ ] Errors are shown to the user in plain language
- [ ] CI green on `main`; README badge shows it
- [ ] Live URL works; a visitor can try it without signing up
- [ ] README has pitch, demo, architecture, run instructions, trade-offs
- [ ] You can explain every technical choice in two sentences

## Appendix D: Glossary

**API**: the server's set of URLs your frontend calls · **REST**: URL + HTTP method conventions · **SPA**: single-page app, one HTML page where JS draws screens · **JWT**: a signed token proving who you are · **Hash**: one-way scramble of a password · **CORS**: browser rule limiting which websites may call your API · **Migration**: versioned database schema change · **ORM** (EF Core): maps C# classes to tables · **DTO**: shape of data sent over the API · **Middleware**: code every request passes through · **CI**: automatic build and test on each push · **Docker image**: packaged app + runtime · **Environment variable**: configuration set outside the code · **Idempotent**: doing it twice has the same effect as once · **Regression test**: a test added so a fixed bug can't return.

## Appendix E: Where to learn each part (official docs are the most reliable)

ASP.NET Core and EF Core: learn.microsoft.com · React: react.dev · Tailwind: tailwindcss.com/docs · Testing Library: testing-library.com · Vitest: vitest.dev · PostgreSQL: postgresql.org/docs · Security checklist: owasp.org (Top 10) · HTTP status codes: developer.mozilla.org · Git: git-scm.com/book
