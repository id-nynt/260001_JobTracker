# Portfolio Audit: Job Tracker

_Audit date: 9 Oct 2026 · Scope: full repo at commit `a2558f9` (`260001_be/`, `260001_fe/`, root config)_


> **Status update.** This audit is a snapshot taken *before* the fixes; paths in it are relative to the repo root. Everything below was addressed except where noted. See [FIX_PLAN.md](FIX_PLAN.md).
>
> | Item | Status |
> | --- | --- |
> | 3.1 per-user data | Fixed and covered by isolation tests |
> | 3.2 silent mock login, 3.3 `periodId` bug | Fixed, with regression tests |
> | 3.4 secrets and data in git | Secret now required from configuration; `.db` files and `Temp/` untracked. The old secret remains in git history, so never use it anywhere |
> | 3.5 tests, 3.19 CI and lint | 32 backend + 20 frontend tests, ESLint, GitHub Actions. No Prettier |
> | 3.6 backend not deployed | Deploy-ready (Docker image verified, Render blueprint, guide). The deployment itself is manual |
> | 3.7-3.17, 3.20 | Fixed |
> | 3.18 `alert()` and theme ternaries | `alert()` replaced by toasts. The `isDark ? … : …` pattern is still used (a Tailwind `dark:` refactor was judged not worth the cost) |
> | Stats dashboard | Done (client-side) |

---

## 1. What this app does

Job Tracker is a full-stack web app for job seekers. It keeps every job application in one place and tracks each one from **Applied → Interviewing → Offered → Accepted / Rejected**. Applications are sorted into user-named **groups** (called "periods" in the backend, e.g. `2026_Data`, `2026_Software`), so one person can run several job searches side by side.

| Layer | Stack |
| --- | --- |
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS 3, Axios |
| Backend | ASP.NET Core 8 Web API, EF Core 8, SQLite, JWT bearer auth, BCrypt, Swagger |
| Deployment | Frontend on **Vercel** in **mock-data mode** (`VITE_USE_MOCK_DATA=true`, data kept in `localStorage`). Backend has a Dockerfile aimed at Render (port 10000) but is **not connected** to the live site. |

**Important context:** the live Vercel demo is frontend-only. It never calls the .NET API. A recruiter who opens the link sees the React app working against browser storage.

---

## 2. What is finished

### Backend (`260001_be/`)
- ✅ REST API with three controllers: `Auth`, `Jobs`, `Periods` (full CRUD on jobs and periods)
- ✅ Registration and login with **BCrypt hashing (work factor 12)** and **JWT** tokens; `[Authorize]` on the data controllers
- ✅ EF Core code-first model with **3 migrations** (initial → users → periods), unique indexes on email/username, length limits
- ✅ Domain validation inside the entity: `JobApplication.Create(...)` factory, `Update*` methods, allowed status list, no future dates
- ✅ DTOs and mappers kept apart from entities
- ✅ Period start/end dates recalculated whenever jobs change; deleting a period moves its jobs into `Default`
- ✅ Migrates automatically on startup and seeds a `Default` period
- ✅ Multi-stage Dockerfile; Swagger UI

### Frontend (`260001_fe/`)
- ✅ Login / Register pages, protected `/dashboard` route, token kept in `localStorage`
- ✅ Two-column dashboard: add-job form, plus collapsible group cards listing the applications
- ✅ Edit jobs inline, delete with confirmation, move a job to another group
- ✅ Create, rename and delete groups
- ✅ Colour-coded status badges, dark/light theme (saved), responsive layout
- ✅ Mock-data mode with 10 realistic sample applications, so the demo works with no backend

### Docs
- ✅ A detailed root README (features, setup, API overview, troubleshooting)

---

## 3. Issues found and recommendations

Ranked by how much each one matters to a reviewer reading your code.

### 🔴 Critical: fix before you show the repo

**3.1 Users can see each other's data (no per-user data isolation)**
`JobApplication` and `Period` have no `UserId`. `JobsController.GetJobs()` and `PeriodsController.GetPeriods()` return **every row in the database** to any logged-in user. Login exists, but it does not separate anyone's data. Any reviewer who reads `JobsController.cs` will see this straight away.
→ Add `UserId` (FK to `User`) to both entities with a migration. Read the user id from the JWT `sub` claim and filter every query by it. Return `404` when someone requests another user's record by id.

**3.2 A wrong password logs you in when the backend is running**
In [authAPI.js](260001_fe/src/api/authAPI.js), `login()` and `register()` use `.catch(() => …mock login…)`. A **401 "Invalid password"** from the real API is caught, and the user is logged in with mock data anyway. `jobAPI`/`groupAPI` work the same way: every API error, including 400 validation errors, quietly falls back to `localStorage`, so real failures never reach the user.
→ Fall back to mock data only when `VITE_USE_MOCK_DATA=true`. Otherwise let errors through and show them in the UI.

**3.3 Moving a job to another group makes it disappear**
The `<select name="periodId">` in [JobCard.jsx](260001_fe/src/components/JobCard.jsx#L116) and [JobForm.jsx](260001_fe/src/components/JobForm.jsx#L131) stores the value as a **string** (`"2"`). [App.jsx:128](260001_fe/src/App.jsx#L128) then filters with `job.periodId === group.id` (a number), so the job matches no group and drops out of the list. This happens on the **live Vercel demo**. Against the real API, `"2"` can also fail to bind to `int?`.
→ Convert in `handleChange`: `name === 'periodId' ? Number(value) : value`.

**3.4 Secrets and data committed to git**
- The JWT signing secret sits in plain text in `appsettings.json`, and the same string is the fallback in `Program.cs` and `AuthController.cs`. Anyone with the repo can forge tokens for a deployment that uses the default.
- `JobTracker.db` (a SQLite database that may hold real registrations) is tracked.
- `Temp/` is listed in `.gitignore` but its 6 files are still tracked.
→ Read the secret from an environment variable and fail at startup if it is missing. Then `git rm --cached` the `.db` files and `Temp/`.

### 🟠 High: what reviewers expect from a full-stack project

**3.5 No tests at all.** There is no xUnit project and no Vitest/RTL setup. Tests are the clearest signal that separates a graduate portfolio from a tutorial clone.
→ Add a handful of xUnit tests for the `JobApplication` validation rules and a few `WebApplicationFactory` API tests (auth required; user A cannot read user B's jobs). On the frontend, test the status filter and the `periodId` case from 3.3 with Vitest.

**3.6 The deployed demo does not show the backend.** Half the engineering effort (.NET, EF, JWT) is invisible on the live site.
→ Deploy the API (Render/Fly/Azure with Postgres, or SQLite on a persistent volume) and point Vercel at it, keeping a **"Try demo"** button that uses mock mode. Or, at minimum, add a section to the README such as "the live demo runs in offline mode; here is a screenshot/GIF of Swagger and the real API."

**3.7 Mock login accepts any credentials.** The README says to log in with `test@mail.com / jobtracker@janny`, but any non-empty pair works. That is fine for a demo, but say so plainly ("any email/password works in demo mode") or swap the form for a one-click "Enter demo" button.

**3.8 Likely Vercel SPA refresh 404.** There is no `vercel.json` rewrite, so a hard refresh or direct link to `/dashboard` probably returns a 404. Check this on the live URL; the fix is:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### 🟡 Medium: code quality signals

| # | Finding | Suggestion |
| --- | --- | --- |
| 3.9 | Three separate Axios clients and interceptors in `authAPI` / `jobAPI` / `groupAPI`, with the mock fallback copied into every method | One shared `apiClient.js`; one `mockStore` module behind the same interface |
| 3.10 | `CORS AllowAnyOrigin()` and Swagger turned on in Production | Restrict CORS to the Vercel domain; serve Swagger only in Development (or keep it on, but deliberately) |
| 3.11 | No 401 handling: an expired JWT leaves the user on a broken dashboard | Axios response interceptor that logs out and redirects to `/login` on 401 |
| 3.12 | Every mutation calls `fetchData()` again (reloads everything) after an optimistic local update | Choose one: optimistic update **or** refetch (React Query would handle this cleanly) |
| 3.13 | 20 `console.log` calls, including the login payload flow | Remove them or put them behind `import.meta.env.DEV` |
| 3.14 | Dead code: `JobList.jsx`, `PeriodSelector.jsx` and `seedMockData.js` are never imported | Delete |
| 3.15 | Weak password rule (min 6), no rate limiting on `/auth/login` | Minimum length of 8; ASP.NET `AddRateLimiter` on the auth routes |
| 3.16 | `JobsController` uses the `Default` period by name, and it is global (shared by all users) | After 3.1, give each user their own default group |
| 3.17 | Synchronous EF calls (`Users.Any`, `FirstOrDefault`) in `AuthController` | Use `AnyAsync` / `FirstOrDefaultAsync` |
| 3.18 | `alert()` for errors; theme colours handled with `isDark ? … : …` ternaries in every component | Toast component; Tailwind `dark:` variant with `darkMode: 'class'` |
| 3.19 | No ESLint/Prettier, no CI | Add a GitHub Action: `dotnet test` + `npm run build` + lint on every push; put the badge in the README |
| 3.20 | Commit history: 7 commits, all named "Update" or similar | From now on, write descriptive commits (`feat: scope jobs to user`). Reviewers do read history. |

### 🟢 Nice-to-have features (pick 1–2 and polish them; don't add all of them)

- **Dashboard stats**: applications per status, response rate, interview conversion, a weekly bar chart. This is the most visible improvement for the least effort.
- **Search and filter** by company, status and date range
- **Follow-up reminders** ("no reply after 14 days")
- **CSV export/import** (the README FAQ already admits there is no export)
- **Kanban view**: drag cards between status columns
- **Status history timeline**: store each status change with a date

---

## 4. Value as a graduate portfolio piece

### Strengths
- **Real full stack across two ecosystems** (.NET + React). That is rarer among graduates than MERN-only projects, and it suits roles at enterprises, banks and government in particular, where .NET is common.
- **Domain modelling shows thought**: factory method, encapsulated validation, DTO/mapper separation, migrations. This is more than CRUD scaffolding.
- **The demo works offline**, so a recruiter can click around with no setup.
- **Docker + Vercel**: shows awareness of deployment.
- **The problem is easy to relate to**, so an interviewer understands it in 5 seconds and you can tell a personal story ("I built this for my own job search").

### Weaknesses a technical reviewer will spot
- Multi-user auth that doesn't isolate data (3.1) is the **one issue that can actively hurt you**. It suggests the auth was added on top rather than designed in.
- No tests, no CI.
- The live demo hides the backend, so a non-technical screener sees "a React to-do list with statuses."
- A job tracker is a **common portfolio idea**, so it has to stand out through quality and one standout feature, not through the idea itself.

### Overall rating

| Dimension | Now | After the critical + high fixes |
| --- | --- | --- |
| Technical breadth | ★★★★☆ | ★★★★☆ |
| Code quality / correctness | ★★☆☆☆ | ★★★★☆ |
| Security awareness | ★★☆☆☆ | ★★★★☆ |
| Testing / engineering practice | ★☆☆☆☆ | ★★★☆☆ |
| Demo / presentation | ★★★☆☆ | ★★★★☆ |
| **Portfolio value** | **Solid foundation, junior-level** | **Strong graduate showcase piece** |

**Verdict:** worth keeping as a **featured** project. The architecture is already better than most graduate CRUD apps; it is held back by a few fixable correctness and security gaps, not by its design. About 2–4 focused days on sections 3.1–3.8 and one stats feature would turn it into a project you can walk an interviewer through with confidence. In an interview, practise explaining **how you fixed 3.1 and why it mattered**. A good answer to that question is worth more than any new feature.

### Suggested order of work
1. Per-user data isolation + tests that prove it (3.1, 3.5)
2. Remove silent mock fallback; fix `periodId` type (3.2, 3.3)
3. Move secrets to env vars; untrack the DB and `Temp/` (3.4)
4. `vercel.json` rewrite; demo-mode wording (3.7, 3.8)
5. Deploy the backend, or document it with screenshots (3.6)
6. CI workflow + README badges + screenshots/GIF at the top of the README
7. One standout feature (stats dashboard recommended)
