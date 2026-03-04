# Deploying Job Tracker Frontend to Vercel

This guide walks through deploying the React frontend to Vercel for your portfolio.

## Why Vercel?

- **Free hosting** with automatic deployments
- **Global CDN** for fast load times
- **No credit card** required
- **Instant HTTPS**
- **Easy rollbacks** and previews
- Perfect for portfolio projects

## Prerequisites

- GitHub account with the Job Tracker repository
- Vercel account (free signup at vercel.com)

## Step-by-Step Deployment

### 1. Prepare Your Frontend Code

First, ensure your frontend builds successfully:

```powershell
cd 260001_fe
npm install
npm run build
```

This creates a `dist/` folder that Vercel will serve.

### 2. Update Environment Configuration

Create a `.env.production` file in `260001_fe/`:

```env
# Use mock data for demo
VITE_USE_MOCK_DATA=true

# Optional: Point to deployed backend later
# VITE_API_URL=https://your-api.example.com/api
```

### 3. Connect to Vercel

#### Option A: GitHub Integration (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with GitHub
3. Click **"Import Project"**
4. Select your Job Tracker repository
5. Configure:
   - **Root Directory**: `260001_fe`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variable:
   - Name: `VITE_USE_MOCK_DATA`
   - Value: `true`
7. Click **"Deploy"**

Vercel will automatically:

- Trigger on every push to `main`
- Show preview deployments for pull requests
- Keep your site live

#### Option B: Drag & Drop

1. Go to [vercel.com](https://vercel.com)
2. Drag the `260001_fe/dist/` folder to Vercel
3. Your site is live instantly

### 4. Test Your Deployment

1. Visit your Vercel URL (something like `job-tracker-xyz.vercel.app`)
2. Login with:
   - **Email**: `test@mail.com`
   - **Password**: `jobtracker@janny`
3. You should see 10 mock job applications loaded
4. Try:
   - Viewing different status groups
   - Creating a new job application
   - Updating job status
   - Deleting a job

### 5. Configure Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Using Mock Data in Production

The frontend is configured with `VITE_USE_MOCK_DATA=true` by default, which means:

- ✓ No backend required
- ✓ All data stored in browser localStorage
- ✓ Fully functional demo for portfolio
- ✓ Data refreshes when you reload (stored in localStorage)

### Disabling Mock Data (When Backend is Ready)

When you deploy a backend:

1. Update `.env.production`:

```env
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://your-backend.example.com/api
```

2. Redeploy to Vercel

The frontend will then connect to your live API.

## Troubleshooting

### Build Fails

```
Error: Cannot find module './components/Login'
```

**Solution**: Ensure you're in the `260001_fe` directory and all dependencies are installed:

```powershell
cd 260001_fe
npm install
npm run build
```

### Mock Data Not Loading

Check browser console (F12 → Console):

```javascript
// Check if mock data is seeded
localStorage.getItem("mock_jobs");
JSON.parse(localStorage.getItem("mock_jobs"));
```

### CORS Issues

Since the frontend runs without a backend by default, CORS doesn't apply. When you add a backend, ensure it has CORS headers.

## Deployment Checklist

- [ ] Frontend code is committed to GitHub
- [ ] `.gitignore` includes `node_modules/` and `dist/`
- [ ] `npm run build` succeeds locally
- [ ] Vercel project is created and connected to GitHub
- [ ] Environment variable `VITE_USE_MOCK_DATA=true` is set
- [ ] Site loads and login works with demo credentials
- [ ] Mock data appears after login

## Next Steps

### Portfolio-Ready State: ✓

- Deployed frontend with working demo
- Responsive design works on all devices
- Shows full-stack application structure

### Optional Future Enhancements:

1. Deploy backend separately (Render, Railway, etc.)
2. Switch to `VITE_USE_MOCK_DATA=false`
3. Use production database (PostgreSQL)
4. Add CI/CD for automated testing

## Example Vercel Configuration

Your `vercel.json` can optionally include:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_USE_MOCK_DATA": "true"
  }
}
```

Place this in the `260001_fe/` directory.

---

**Questions?** Check the project [README.md](../README.md) for architecture details.
