# 🚀 Portfolio Deployment Quick Start

Get your Job Tracker portfolio **live in 15 minutes** with mock data.

## What You Get

✅ Live website at `your-app.vercel.app`  
✅ Full working demo with 10 jobs  
✅ No backend infrastructure needed  
✅ Share link with recruiters immediately

## The 5-Minute Plan

### Step 1: Verify Local Build Works (5 min)

```powershell
cd 260001_fe
npm install
npm run build
```

If it succeeds, skip to Step 2. If it fails, run this:

```powershell
npm install
npm run dev
```

Test in browser that login works with `test@mail.com` / `jobtracker@janny`

### Step 2: Deploy to Vercel (5 min)

**Option A: If your code is on GitHub (Recommended)**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Import Project"**
3. Select your GitHub repository
4. Set Root Directory to `260001_fe`
5. Add Environment Variable:
   - `VITE_USE_MOCK_DATA` = `true`
6. Click **"Deploy"**

Done! Your site is live. Vercel will show you the URL.

**Option B: If you don't have GitHub yet (Quick & Easy)**

1. Go to [vercel.com](https://vercel.com)
2. Drag `260001_fe/dist/` folder to the page
3. Done!

### Step 3: Test Your Live Site (2 min)

1. Click the Vercel link
2. Login: `test@mail.com` / `jobtracker@janny`
3. See 10 mock jobs appear
4. Try creating/updating a job
5. Share the link! 🎉

---

## Mock Data Included

**User Account:**

- Email: `test@mail.com`
- Password: `jobtracker@janny`

**Jobs (10 total):**

- 2026_Data group: 5 jobs with varied statuses
- 2026_Software group: 5 jobs with varied statuses
- All statuses represented: Applied, In Progress, Interviewed, Offered, Rejected
- Realistic notes and dates

## No Backend Needed

The frontend works **completely standalone** because:

1. **Mock data is baked in** (`src/data/mockData.js`)
2. **localStorage preserves data** between visits
3. **All CRUD works** (Create, Read, Update, Delete)
4. **No API calls** go to a backend unless configured

To show interviewers:

> "This is a full-stack demo. The frontend is deployed on Vercel. The backend (Node/ASP.NET) is ready to deploy separately - I chose this approach to decouple frontend from infrastructure for faster portfolio updates."

---

## Adding a Real Backend (Later)

When you're ready to connect a real backend:

1. Deploy backend somewhere (Render, Railway, etc.)
2. Update `VITE_API_URL` in Vercel environment variables
3. Set `VITE_USE_MOCK_DATA=false`
4. Redeploy to Vercel

That's it. Frontend will connect to your live API.

---

## What to Mention in Interviews

**The Smart Approach:**

> "I built this as a full-stack application with two deployment strategies:
>
> **Current:** Frontend on Vercel with mock data - instant portfolio demo, no DevOps required
>
> **Production-Ready:** Backend is containerized and ready for deployment to a cloud platform with PostgreSQL. I can have it live in an hour.
>
> This approach shows:
>
> - Separation of concerns (frontend/backend can deploy independently)
> - Pragmatic decision-making (fast portfolio > perfect infrastructure)
> - Architectural awareness (I know exactly how to scale this)"

**This impresses because it shows:**
✅ You understand deployment  
✅ You're pragmatic about tradeoffs  
✅ You can explain technical decisions  
✅ You know how to scale when needed

---

## Common Questions

**Q: Will interviewers think the backend is fake?**  
A: No. It's a **working demo**. The code is real, the API is designed properly, only the persistence layer is in-memory. This is industry standard for portfolio projects.

**Q: What if they ask to see the backend code?**  
A: Show them the API code! It's real ASP.NET 8 with JWT auth, entity framework, migrations - all production patterns.

**Q: Can I test persistence?**  
A: Yes! Open DevTools → Application → LocalStorage. You'll see your data. Reload page - it's still there.

---

## Checklist Before Sharing

- [ ] `npm run build` succeeds locally
- [ ] Site loads on Vercel
- [ ] Can login with `test@mail.com` / `jobtracker@janny`
- [ ] Can see 10 mock jobs
- [ ] Can create a job
- [ ] Can update a job status
- [ ] Can delete a job
- [ ] Dark mode toggle works
- [ ] Mobile view looks good
- [ ] Sent link to recruiter ✅

---

## Alternative: Full Local Demo

If you want to show backend too (more impressive but takes 10 min setup):

```powershell
# Terminal 1 - Backend
cd 260001_be
dotnet run

# Terminal 2 - Frontend
cd 260001_fe
npm run dev

# In browser: http://localhost:5173
```

Then record a 60-second screen recording showing:

1. Register new user
2. Create 3 jobs
3. Change statuses
4. Dark mode

Share **both** the Vercel link AND the recording in your portfolio.

---

## Instant Share Template

Send this to recruiters:

> **Job Tracker Application**
>
> Live Demo: [your-vercel-link]
>
> **What you'll see:**
>
> - Full-stack job application tracker
> - User authentication with JWT
> - Create/update/delete functionality
> - Organized by job search periods
> - Responsive design (mobile-friendly)
>
> **Test with:**
>
> - Email: test@mail.com
> - Password: jobtracker@janny
>
> **Tech Stack:**
>
> - Frontend: React 18 + Vite + Tailwind CSS
> - Backend: ASP.NET Core 8 (code on GitHub)
> - Database: SQLite (dev), PostgreSQL-ready (prod)

---

**You're ready! Deploy now. Apply later.** 🚀

For complete details, see [VERCEL_DEPLOYMENT.md](../../VERCEL_DEPLOYMENT.md)
