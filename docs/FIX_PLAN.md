# Fix Plan: Job Tracker

_Created 9 Oct 2026. Based on [PORTFOLIO_AUDIT.md](PORTFOLIO_AUDIT.md); section numbers like (3.1) point to the audit._

**Goal:** turn the project into a graduate showcase piece that a technical reviewer can read without finding red flags, and that a non-technical screener can try in one click.

**Total estimate:** about 7–9 focused days, split into 7 phases. Each phase ends in a working, deployable state, so you can stop at any phase and still have a better project than you started with.

| Phase | Theme | Est. | Fixes |
| --- | --- | --- | --- |
| 0 | Repo hygiene & safety net | 0.5 d | 3.4, 3.14, 3.20 |
| 1 | Backend: per-user data, security, correctness | 1.5 d | 3.1, 3.4, 3.10, 3.15, 3.16, 3.17 |
| 2 | Backend tests | 1 d | 3.5 |
| 3 | Frontend: API layer & demo mode | 1.5 d | 3.2, 3.3, 3.7, 3.9, 3.11, 3.12, 3.13 |
| 4 | Frontend tests, lint, polish | 1 d | 3.5, 3.18, 3.19 |
| 5 | Deploy backend + CI | 1 d | 3.6, 3.8, 3.19 |
| 6 | Standout feature: stats dashboard | 1–1.5 d | §3 nice-to-have |
| 7 | README & presentation | 0.5 d | §4 |

---

## Decisions to make before starting

These change the work, so settle them first. My recommendation is listed first.

1. **Production database**
   - ✅ **PostgreSQL (Neon or Supabase free tier).** Data survives redeploys, and it's what employers use. EF Core migrations have to be regenerated for Postgres; that's fine because Phase 1 resets them anyway.
   - SQLite on a Render persistent disk. Less work, but persistent disks need a paid plan.
2. **Backend host**
   - ✅ **Render free web service** (your Dockerfile already targets port 10000). Downside: it goes to sleep and takes ~30–60 s to wake up. That's why the demo mode below stays.
   - Azure App Service / Fly.io. A good choice if you're aiming for .NET-heavy employers, but more setup.
3. **How the demo works**
   - ✅ **Both modes on one site.** The login page gets a **"Try the demo (no sign-up)"** button that runs fully in the browser, and real register/login goes to the API. Mock mode becomes a *runtime* choice, not a build-time env var.
   - Keep demo-only. Simpler, but the backend stays invisible.

The rest of this plan assumes the ✅ options.

---

## Working conventions (start in Phase 0, keep throughout)

- **One branch per phase** (`fix/phase-1-user-scoping`, …), merged into `main` through a GitHub pull request, even when you're working alone. Reviewers look at PR history.
- **Conventional commits:** `feat:`, `fix:`, `test:`, `refactor:`, `chore:`, `docs:`. Example: `fix(api): scope job queries to the authenticated user`.
- **Small commits:** one logical change each. No more "Update".
- After each phase, run the checklist under **"Done when"** before merging.

---

## Phase 0: Repo hygiene & safety net (0.5 d)

| # | Task | Details |
| --- | --- | --- |
| 0.1 | Stop tracking the database files | `git rm --cached 260001_be/JobTracker.db 260001_be/JobTracker.db-shm 260001_be/JobTracker.db-wal`; add `*.db`, `*.db-shm`, `*.db-wal` to the root `.gitignore`. |
| 0.2 | Stop tracking `Temp/` | `git rm -r --cached Temp/` (it's already in `.gitignore`). Keep the files locally if they're useful to you. |
| 0.3 | Delete dead code | Remove `260001_fe/src/components/JobList.jsx`, `PeriodSelector.jsx` and `src/data/seedMockData.js` (none of them are imported). |
| 0.4 | Treat the committed JWT secret as public | The string in `appsettings.json` is already in the git history. Don't bother rewriting history; make sure **no deployment ever uses it** (enforced in 1.6). |
| 0.5 | Add an `.editorconfig` | Consistent indentation for C# (4 spaces) and JS (2 spaces). |

**Done when:** `git status` is clean, `npm run build` and `dotnet build` both pass, and the app runs the same as before.

---

## Phase 1: Backend per-user data, security & correctness (1.5 d)

### 1A. Per-user data isolation (3.1, 3.16): the most important change in the plan

| # | Task | Details |
| --- | --- | --- |
| 1.1 | Add ownership to entities | `Period.UserId` (int, required, FK → `User`, cascade delete). `JobApplication.UserId` (int, required, FK → `User`). Add `User.Periods` / `User.JobApplications` navigation properties. Index on `(UserId, PeriodId)` for jobs and on `(UserId, Name)` for periods (unique, so one user can't have two groups with the same name). |
| 1.2 | Current-user helper | Add `Extensions/ClaimsPrincipalExtensions.cs` with `int GetUserId(this ClaimsPrincipal user)` that reads the `sub` claim. **Gotcha:** ASP.NET maps `sub` to `ClaimTypes.NameIdentifier` by default. Either set `options.MapInboundClaims = false` in `AddJwtBearer`, or read `ClaimTypes.NameIdentifier`. Choose one and test it. |
| 1.3 | Scope every query | In `JobsController` and `PeriodsController`, every read, update and delete filters on `x.UserId == userId`. Use `FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId)` instead of `FindAsync(id)`. Another user's record returns **404** (not 403), so the API doesn't reveal that the record exists. |
| 1.4 | Validate the period in create/update job | When a job is created or moved, check that the target `PeriodId` belongs to the same user. Otherwise return 400. |
| 1.5 | Per-user Default group | Remove the global "Default" seed from `Program.cs`. Create a `Default` period for the user inside `AuthController.Register`, in the same `SaveChangesAsync` as the new user. Look up the user's own Default in `JobsController.CreateJob` and `PeriodsController.DeletePeriod`. |

**Migrations:** delete `Migrations/` and create one clean `InitialCreate` for Postgres (decision 1). This is acceptable because there's no real production data. Say so in the PR description so it's clearly deliberate.

### 1B. Security config (3.4, 3.10, 3.15)

| # | Task | Details |
| --- | --- | --- |
| 1.6 | Secrets from the environment | Remove `Jwt:Secret` from `appsettings.json` and delete both `?? "your-secret-key…"` fallbacks. In `Program.cs`: `var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret is not configured");`. Locally, use `dotnet user-secrets set "Jwt:Secret" "<64 random chars>"`. On Render, set the env var `Jwt__Secret`. Also move the connection string to `ConnectionStrings__DefaultConnection`. |
| 1.7 | Only one place builds JWTs | Move token creation into a `Services/TokenService.cs` (`ITokenService`) registered in DI, with options bound from a `JwtOptions` class. Removes the copy-pasted config reads in `AuthController`. Also fix the inconsistency: `Program.cs` uses `Encoding.UTF8` and `AuthController` uses `Encoding.ASCII`. |
| 1.8 | Lock down CORS | Read allowed origins from config (`Cors:AllowedOrigins` = `http://localhost:3000`, `https://<your-app>.vercel.app`). `policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()`. |
| 1.9 | Swagger | Keep it in production on purpose (it shows off the API) but add a JWT "Authorize" button with `AddSecurityDefinition("Bearer", …)`. Mention it in the README. |
| 1.10 | Stronger auth rules | Passwords of at least 8 characters. Normalise email to lowercase before saving and comparing. Add `[EmailAddress]` / `[Required]` / `[StringLength]` data annotations to the DTOs so `[ApiController]` validates automatically, and remove the manual `IsNullOrWhiteSpace` checks. |
| 1.11 | Rate limit the auth routes | `builder.Services.AddRateLimiter(...)` with a fixed window (e.g. 10 requests/min per IP) on `/api/auth/*` using `[EnableRateLimiting("auth")]`. |
| 1.12 | Remove the debug endpoint | Delete `GET /api/auth/test`, or replace it with `app.MapHealthChecks("/health")` (Render can use that for health checks). |

### 1C. Correctness & code quality (3.17 and issues found while planning)

| # | Task | Details |
| --- | --- | --- |
| 1.13 | Async EF calls | `Users.Any` → `AnyAsync`, `FirstOrDefault` → `FirstOrDefaultAsync` in `AuthController`. |
| 1.14 | **Bug:** group job count is always 0 | `GetPeriods()` doesn't `.Include(p => p.JobApplications)`, so `PeriodMapper` reports `Count = 0`. Use a projection instead: `.Select(p => new PeriodDto { …, Count = p.JobApplications.Count })`. That avoids loading every job. |
| 1.15 | **Bug:** stale group dates | `DeleteJob` never recalculates the period's start/end dates, and `UpdatePeriodDates` leaves the old dates in place when a group becomes empty. Call it after delete and set both dates to `null` when there are no jobs. |
| 1.16 | **Bug:** the job URL can't be cleared | `UpdateJob` ignores empty strings, so a user can't clear `JobUrl`. Treat `""` as "clear" for optional fields. |
| 1.17 | Consistent error shape | Replace `StatusCode(500, "string")` / `BadRequest(new { error })` / `AuthResponse.Message` with **ProblemDetails** everywhere: `builder.Services.AddProblemDetails()` + `app.UseExceptionHandler()`. Then remove the per-action `try/catch (Exception)` blocks. They only exist to return 500s. |
| 1.18 | Status as an enum | `enum ApplicationStatus { Applied, Interviewing, Offered, Accepted, Rejected }`, stored as a string through `HasConversion<string>()`, with `JsonStringEnumConverter` in `AddControllers().AddJsonOptions(...)`. This replaces the `ValidStatuses` string array. |
| 1.19 | Unused mapper method | `JobApplicationMapper.CreateFromDto` drops `Status` and isn't used. Delete it, or use it in `CreateJob` (after fixing it to pass status). |
| 1.20 | Make `Program` testable | Add `public partial class Program { }` at the bottom of `Program.cs` (needed for `WebApplicationFactory` in Phase 2). Skip `db.Database.Migrate()` when `app.Environment.IsEnvironment("Testing")`. |
| 1.21 | Postgres provider | Swap `Microsoft.EntityFrameworkCore.Sqlite` for `Npgsql.EntityFrameworkCore.PostgreSQL` 8.x. Add a root `docker-compose.yml` with a `postgres:16` service so local dev = `docker compose up -d db` + `dotnet run`. |

**Done when:** using Swagger, register users **A** and **B**. A creates jobs, and B's `GET /api/jobs` returns only B's own (empty) list plus B's Default group. `GET /api/jobs/{A's id}` as B → 404. Without `Jwt__Secret` set, the app refuses to start.

---

## Phase 2: Backend tests (1 d)

**Gotcha:** `JobTracker.Api.csproj` sits in `260001_be/` and compiles **every `.cs` file under that folder**. A test project placed *inside* `260001_be/` would get compiled into the API. Put it next to the API instead:

```
260001_be/                    (API, unchanged location)
260001_be.Tests/              (new)
  JobTracker.Api.Tests.csproj  → xunit, FluentAssertions, Microsoft.AspNetCore.Mvc.Testing,
                                 Microsoft.EntityFrameworkCore.Sqlite (in-memory for tests)
  Domain/JobApplicationTests.cs
  Api/CustomWebApplicationFactory.cs
  Api/AuthEndpointsTests.cs
  Api/JobsEndpointsTests.cs
  Api/PeriodsEndpointsTests.cs
```
Add it to `260001_Job_Tracker.sln` (`dotnet sln add`).

**Test factory:** in `ConfigureWebHost`, use environment `Testing`, swap the DbContext for SQLite `DataSource=:memory:` with a single connection kept open, call `EnsureCreated()`, and set `Jwt:Secret` to a test value.

**Tests to write (about 20 in total, enough to make the point):**

| Area | Cases |
| --- | --- |
| Domain (`JobApplication`) | empty company → throws · empty title → throws · future date → throws · invalid status rejected · `ChangePeriod(0)` throws · `UpdatedAt` changes on update |
| Auth | register → 200 + token · duplicate email → 400 · login with wrong password → **401** · login with username works · protected endpoint without a token → 401 |
| **Isolation** (the headline tests) | user B can't list, get, update or delete user A's jobs (404) · B can't move a job into A's period (400) · B can't rename or delete A's period (404) |
| Periods | deleting a period moves its jobs into the user's Default · the Default period can't be deleted · `Count` and dates are correct after adding/deleting jobs (covers 1.14, 1.15) |

**Done when:** `dotnet test` passes locally, and the isolation tests **fail** when you temporarily remove a `UserId` filter (shows the tests actually check something).

---

## Phase 3: Frontend API layer & demo mode (1.5 d)

### 3A. Restructure the API layer (3.2, 3.9)

Replace the three duplicated clients with one shared client and two interchangeable implementations:

```
src/api/
  client.js       ← single axios instance, VITE_API_URL, auth header interceptor,
                    401 interceptor → clear session + redirect to /login (3.11)
  httpApi.js      ← real implementation: auth/jobs/groups → backend, errors are thrown, never swallowed
  mockApi.js      ← demo implementation: same method names, backed by localStorage
  index.js        ← exports `api`, choosing mockApi when session.mode === 'demo', else httpApi
src/data/mockData.js   (unchanged seed data)
```

| # | Task | Details |
| --- | --- | --- |
| 3.1 | **Remove every `.catch(() => mock…)`** | This fixes "a wrong password still logs you in" (3.2). In `httpApi`, errors go up to the caller, and components show `err.response?.data?.detail` (ProblemDetails from 1.17). |
| 3.2 | Demo mode chosen at runtime | Session in localStorage: `{ mode: 'demo' \| 'api', token, user }`. The **"Try the demo"** button on the login page calls `mockApi.startDemo()`, which seeds the sample data and sets `mode: 'demo'`. Logout clears both modes. Delete `VITE_USE_MOCK_DATA` from `.env.*`. |
| 3.3 | Make the mock layer behave like the API | `mockApi` recalculates group `dateStart/dateEnd/count` on every job change, moves jobs into Default when a group is deleted, and blocks deleting Default. Then the demo shows the same behaviour as the real backend. |
| 3.4 | Demo banner | A thin bar on the dashboard in demo mode: *"Demo mode: data is stored only in this browser. [Create a real account]"*. |

### 3B. Fix the bugs (3.3, 3.12)

| # | Task | Details |
| --- | --- | --- |
| 3.5 | **`periodId` type bug** | In both `JobForm.handleChange` and `JobCard.handleChange`: `[name]: name === 'periodId' ? Number(value) : value`. As a backup, compare with `Number(job.periodId) === group.id` in `App.jsx`. |
| 3.6 | `null` notes warning | `JobCard` edit: `value={editData.notes ?? ''}` and `jobUrl ?? ''` (avoids React's controlled/uncontrolled warning when the API returns `null`). |
| 3.7 | Stale edit state | `JobCard` copies `job` into state once. Reset it when the edit form opens (`handleEdit = () => { setEditData(job); setIsEditing(true) }`). |
| 3.8 | One way to sync data | Remove the local state updates *followed by* `fetchData()`. Choose **one**: (a) simple, just `await fetchData()` after each change; or (b) better, add **TanStack Query** (`useQuery(['jobs'])`, `useMutation` + `invalidateQueries`). (b) is a good thing to mention in interviews, but only if you're comfortable explaining it. |
| 3.9 | Remove the `selectedGroupId` leftover | It's set but never changed by the UI. Either remove it, or make clicking a group header select it as the form's default group. |
| 3.10 | Clean up logging | Delete the 20 `console.log`s. Keep `console.error` only inside `if (import.meta.env.DEV)`. |

### 3C. Routing & deployment fix (3.8)

| # | Task | Details |
| --- | --- | --- |
| 3.11 | `260001_fe/vercel.json` | `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`, so refreshing `/dashboard` works. |
| 3.12 | Page metadata | `index.html`: the favicon points at `/vite.svg`, which doesn't exist. Add a real icon, a `<meta name="description">`, and Open Graph tags (title, description, a screenshot), so the link previews nicely when shared on LinkedIn. |

**Done when:**
- With the backend **off**: a real login shows a clear "Can't reach server" error, and "Try the demo" still works.
- With the backend **on**: a wrong password shows "Invalid email/username or password". Moving a job between groups works in both modes. A hard refresh on `/dashboard` works on a Vercel preview deploy.

---

## Phase 4: Frontend tests, lint & polish (1 d)

| # | Task | Details |
| --- | --- | --- |
| 4.1 | Tooling | `npm i -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom eslint eslint-plugin-react eslint-plugin-react-hooks prettier`. Scripts: `"test": "vitest"`, `"lint": "eslint src"`, `"format": "prettier --write src"`. |
| 4.2 | Tests (about 10) | `mockApi`: create/update/delete keep group counts and dates right, and deleting a group moves its jobs into Default. `JobForm`: required fields, and a selected group is submitted as a **number** (regression test for 3.5). `JobCard`: editing and moving a group calls `onUpdate` with a numeric `periodId`. `Login`: an API 401 shows the error message and does **not** navigate (regression test for 3.1). |
| 4.3 | Dark mode the Tailwind way (3.18) | `tailwind.config.js` → `darkMode: 'class'`. `ThemeContext` toggles `document.documentElement.classList`. Replace the `isDark ? 'a' : 'b'` ternaries with `className="text-black dark:text-white"`. This removes a lot of noise; do it file by file. |
| 4.4 | Replace `alert()` / `window.confirm` | Small `Toast` component for errors and successes. A confirm modal for deletes (or keep `confirm`, but use toasts for errors at least). |
| 4.5 | Accessibility pass | Icon-only buttons get `aria-label` ("Edit application", "Delete group"). The group header becomes a `<button aria-expanded>`. The rename field gets a label. Check colour contrast for the badges in both themes. Run Lighthouse and aim for **≥ 90** on Accessibility. |
| 4.6 | Empty and loading states | Skeleton cards instead of "Loading...". A friendly empty state ("No applications yet. Add your first one on the left"). |

**Done when:** `npm run lint`, `npm test` and `npm run build` all pass with no warnings.

---

## Phase 5: Deploy the backend + CI (1 d)

### 5A. Deploy

| # | Task | Details |
| --- | --- | --- |
| 5.1 | Database | Create a Neon (or Supabase) Postgres database and copy the connection string. |
| 5.2 | Render web service | Point it at the repo, root dir `260001_be`, Docker. Env vars: `ConnectionStrings__DefaultConnection`, `Jwt__Secret` (newly generated, 64+ chars), `Cors__AllowedOrigins__0=https://<app>.vercel.app`. Health check path `/health`. |
| 5.3 | Dockerfile tidy-up | Remove `mkdir /app/data` (no SQLite any more). Use `ENV ASPNETCORE_HTTP_PORTS=10000` (the .NET 8 style). Run as non-root with `USER app`. Add a `.dockerignore` (`bin/`, `obj/`, `*.db`). |
| 5.4 | Vercel | Set `VITE_API_URL=https://<api>.onrender.com/api` in the Vercel project settings (production + preview). |
| 5.5 | Cold-start UX | On the login page, send a background request to `/health` when it loads, to wake the API. If a real login takes > 3 s, show "Waking up the server (free hosting), ~30 s…". Turns a weakness into a sign that you thought about it. |

### 5B. CI: `.github/workflows/ci.yml`

Two jobs, triggered on push and on pull requests to `main`:

```yaml
backend:  ubuntu-latest → setup-dotnet 8 → dotnet restore → dotnet build --no-restore -warnaserror
          → dotnet test --no-build
frontend: ubuntu-latest → setup-node 20 (cache npm) → working-directory 260001_fe
          → npm ci → npm run lint → npm test -- --run → npm run build
```

Then, on GitHub, protect `main` (require CI to pass before merging) and put the CI status badge in the README.

**Done when:** the live Vercel URL lets you (a) register a real account, log out and back in, and see your data persist, and (b) click "Try the demo". The CI badge is green.

---

## Phase 6: Standout feature, stats dashboard (1–1.5 d)

Pick **one** feature and polish it properly. Stats is recommended: it's the most visible improvement, it's useful, and it shows both backend aggregation and frontend data visualisation.

| # | Task | Details |
| --- | --- | --- |
| 6.1 | Endpoint | `GET /api/stats?periodId=` → `{ total, byStatus: {Applied: n, …}, responseRate, interviewRate, offerRate, weekly: [{weekStart, count}] }`. Do the aggregation with LINQ `GroupBy` in the database, scoped to the user. Add 2–3 tests. |
| 6.2 | Mock version | The same calculation in `mockApi`, so the demo shows charts too. |
| 6.3 | UI | A row of KPI tiles (Total · Response rate · Interviews · Offers) above the groups, plus one bar chart of applications per week (Recharts). A group filter dropdown re-scopes the stats. |
| 6.4 | Definitions | Define the metrics in one place and show them in a tooltip: response rate = (Interviewing + Offered + Accepted + Rejected) ÷ total. Decide whether *Rejected* counts as a response, then document it. |

Ideas for later (don't start these until Phases 0–7 are done): search and filter, CSV export, a status-history timeline, a Kanban view.

---

## Phase 7: README & presentation (0.5 d)

Rewrite the top of [README.md](README.md) for a recruiter who spends **30 seconds** on it:

1. **Title + one-line pitch + badges** (CI, .NET 8, React 18, licence)
2. **Live demo link** + "Try the demo, no sign-up needed"
3. **A GIF (≤ 10 s)** showing: add an application → change its status → stats update
4. **Highlights** (5 bullets): per-user data isolation, JWT + BCrypt, EF Core + Postgres, automated tests in CI, offline demo mode
5. **Architecture diagram** (a simple Mermaid diagram: Browser → Vercel (React) → Render (.NET API) → Neon (Postgres))
6. **"What I learned / trade-offs"**: e.g. why you return 404 instead of 403 for other users' data, why demo mode is a separate implementation instead of a fallback, the free-tier cold-start trade-off. **This section is the one interviewers ask about.**
7. Then the existing setup/API docs (updated: Postgres via `docker compose`, user-secrets for the JWT key, `npm test` / `dotnet test`)

Also: fix the README's wrong claims (the test credentials: in the new demo flow no credentials are needed), add a `LICENSE` (MIT), and update [PORTFOLIO_AUDIT.md](PORTFOLIO_AUDIT.md) or move it to `docs/` once the issues are fixed.

**Done when:** a friend who isn't a developer can open the repo, understand what it is in 30 seconds, and use the demo without asking you anything.

---

## Interview prep (after Phase 7)

Be ready to explain these out loud in 1–2 minutes each:

1. **"Walk me through the architecture."** Use the diagram from Phase 7.
2. **"How do you stop one user seeing another's data?"** `UserId` from the JWT `sub` claim, every query scoped, 404 rather than 403, and the tests that prove it.
3. **"What was the hardest bug?"** Either the silent mock fallback hiding auth failures, or the `periodId` string/number mismatch. Explain why it happened and how a test now guards against it.
4. **"What would you do with more time?"** Refresh tokens / httpOnly cookies instead of localStorage, the status-history timeline, end-to-end tests with Playwright.

---

## Progress checklist

- [x] Phase 0: Repo hygiene
- [x] Phase 1: Backend per-user data, security, correctness (verified by manual API testing; automated tests come in Phase 2)
- [x] Phase 2: Backend tests (18 test methods, 29 cases; mutation-checked)
- [x] Phase 3: Frontend API layer, demo mode, bug fixes (verified with scripts against the demo store and live backend; no browser run)
- [x] Phase 4: Frontend tests, lint, polish (20 tests, ESLint, toasts, accessibility. Skipped: Tailwind `dark:` refactor and Prettier, judged not worth the cost)
- [x] Phase 5: Deploy-ready backend + CI (Docker image verified locally, Render blueprint, `docs/DEPLOYMENT.md`, workflow added. **Manual:** create the accounts, deploy, and confirm CI is green on GitHub)
- [x] Phase 6: Stats dashboard (computed client-side by a tested pure function instead of a new endpoint)
- [x] Phase 7: README & presentation (**Manual:** live demo URL and a demo GIF/screenshot)
