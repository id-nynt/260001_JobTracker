# Deployment guide

Three free services, set up in this order (each step needs a value from the previous one):

```
Browser ──> Vercel (React frontend) ──> Render (.NET API, Docker) ──> Neon (PostgreSQL)
```

You need free accounts on [Neon](https://neon.tech), [Render](https://render.com) and [Vercel](https://vercel.com), and this repo on GitHub.

> **Free-tier trade-off:** Render's free web service sleeps after ~15 minutes without traffic, and the first request afterwards takes 30–60 seconds. The login page pings the API as soon as it opens and explains the wait, and the **Try the demo** button works without the API at all.

## 1. Database (Neon)

1. Create a project and a database (any name, e.g. `jobtracker`). Choose the region closest to your Render region.
2. Copy the **connection string**. It looks like `postgresql://user:password@ep-xxxx.region.aws.neon.tech/jobtracker?sslmode=require`.
   The API accepts this URL form directly, so paste it as it is.

You do not need to create tables: the API applies its migrations when it starts.

## 2. Backend (Render)

Option A, with the blueprint (recommended): **New > Blueprint**, select this repo. Render reads [render.yaml](../render.yaml) and asks for the values marked `sync: false`.

Option B, manually: **New > Web Service**, select the repo, Runtime **Docker**, Dockerfile path `./260001_be/Dockerfile`, Docker context `./260001_be`, Health check path `/health`, plan Free.

Environment variables:

| Variable | Value |
| --- | --- |
| `ConnectionStrings__DefaultConnection` | the Neon URL from step 1 |
| `Jwt__Secret` | at least 32 random characters (the blueprint generates one). **Never reuse the one that was committed in git history.** |
| `Cors__AllowedOrigins__0` | your Vercel URL, e.g. `https://job-tracker.vercel.app` (no trailing slash). Fill it in after step 3 and redeploy. |

Check it: open `https://<your-service>.onrender.com/health` (should say `Healthy`) and `/swagger`.

## 3. Frontend (Vercel)

1. **Add New > Project**, import the repo.
2. **Root Directory:** `260001_fe`. Framework preset: Vite (build `npm run build`, output `dist`; both are detected).
3. **Environment Variables:** `VITE_API_URL` = `https://<your-service>.onrender.com/api`
4. Deploy. Copy the resulting URL into Render's `Cors__AllowedOrigins__0` and redeploy the API.

[`260001_fe/vercel.json`](../260001_fe/vercel.json) makes every path serve the app, so refreshing `/dashboard` works.

Preview deployments get their own URLs; if you want real sign-in on them, add those origins as `Cors__AllowedOrigins__1`, and so on. The demo works everywhere.

## 4. Verify (the 2-minute smoke test)

1. Open the Vercel URL, click **Try the demo**: sample data and the demo banner appear.
2. Log out, **Register** a new account: you land on an empty dashboard with a `Default` group.
3. Add a job, move it to a new group, refresh the page: it is still there.
4. Log out, log in with a wrong password: you see "Invalid email/username or password".
5. Register a second account: it must not see the first account's job.

## 5. Protect `main` (GitHub)

Settings > Branches > add a rule for `main`: **Require status checks to pass** and select `backend` and `frontend` (they appear after the first CI run, see [ci.yml](../.github/workflows/ci.yml)). Work on branches and merge through pull requests.

## Running the same thing locally

```bash
docker run -d --name jobtracker-db -e POSTGRES_DB=jobtracker -e POSTGRES_USER=jobtracker \
  -e POSTGRES_PASSWORD=jobtracker -p 5432:5432 postgres:16     # or: docker compose up -d db
cd 260001_be
dotnet user-secrets set "Jwt:Secret" "any-random-string-of-32-or-more-chars"
dotnet run                                                      # http://localhost:5000, applies migrations
cd ../260001_fe && npm install && npm run dev                   # http://localhost:3000 (proxies /api to :5000)
```

To test the production image: `docker build -t jobtracker-api ./260001_be`, then run it with the three environment variables above and `-p 10000:10000`.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Login says "Can't reach the server" | API asleep (wait a minute), wrong `VITE_API_URL`, or the API crashed: check Render logs |
| Browser console shows a CORS error | `Cors__AllowedOrigins__0` doesn't exactly match the site's origin (scheme + host, no trailing slash) |
| API exits at startup with `Jwt:Secret must be configured` | `Jwt__Secret` is missing or shorter than 32 characters (this is deliberate) |
| Every request returns 401 after redeploying | `Jwt__Secret` changed, so old tokens are invalid. Log in again |
| "Accounts are not available on this site yet" on the login page | `VITE_API_URL` was not set at build time. Set it in Vercel and redeploy (Vite bakes it in at build) |
