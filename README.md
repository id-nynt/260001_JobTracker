# Job Tracker Application

A full-stack job tracking application built with **ASP.NET Core 8** backend and **React 18** frontend. Track job applications, organize them into groups, and monitor your job search progress.

**Portfolio Status:** ✅ **Production-ready frontend deployment** | Backend ready for integration

## Features

- ✅ User authentication with JWT tokens
- ✅ Create, read, update, delete job applications
- ✅ Organize applications into custom groups (2026_Data, 2026_Software, etc.)
- ✅ Track application status (Applied, In Progress, Interviewed, Offered, Rejected)
- ✅ Responsive design (mobile-first with Tailwind CSS)
- ✅ Dark/Light mode toggle
- ✅ Mock data included for instant demo

## Quick Links

- **🚀 [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)** - Deploy frontend in 5 minutes
- **💻 Local Development** - Run both services locally
- **📊 Architecture** - See below for tech stack details

## Project Structure

```
260001_Job_Tracker/
├── 260001_be/                      # Backend (ASP.NET Core 8)
│   ├── Controllers/                # API endpoints
│   ├── Models/                     # Data models (JobApplication, User, Period)
│   ├── Data/                       # DbContext (EF Core)
│   ├── Migrations/                 # Database schema
│   ├── DTOs/                       # Data transfer objects
│   ├── Mappers/                    # Model-to-DTO mappings
│   ├── appsettings.json            # Production config (SQLite)
│   ├── appsettings.Development.json # Dev config (local SQLite)
│   └── Program.cs                  # API setup & middleware
│
├── 260001_fe/                      # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/             # React components (Login, JobForm, etc.)
│   │   ├── api/                    # API client with mock data fallback
│   │   ├── data/                   # Mock data & seed utilities
│   │   ├── context/                # Theme context (dark mode)
│   │   └── styles/                 # Tailwind CSS
│   ├── .env.local                  # Dev config (localhost:5000)
│   └── vite.config.js              # Build configuration
│
└── README.md                        # This file
```

## Prerequisites

### Backend Requirements

- **.NET 8.0** or higher - [Download](https://dotnet.microsoft.com/download)
- SQLite (included with .NET)

### Frontend Requirements

- **Node.js** 16+ and **npm** - [Download](https://nodejs.org)

### General Tools

- **Git** - [Download](https://git-scm.com)
- **Visual Studio Code** (recommended)

---

## 🚀 Quick Start (5 minutes)

### Option A: Frontend Only (Portfolio Demo)

If you want to **deploy to web and share with interviewers**:

```bash
# 1. Navigate to frontend
cd 260001_fe

# 2. Install dependencies
npm install

# 3. Run locally (with mock data)
npm run dev
```

**Then deploy to Vercel** using the [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)

**Demo Credentials:**

- **Email:** `test@mail.com`
- **Password:** `jobtracker@janny`

**Mock Data Included:**

- 2 job search periods (2026_Data, 2026_Software)
- 10 sample job applications with all statuses
- Fully functional CRUD operations

---

### Option B: Full Stack (Local Development)

If you're **developing locally with a real backend**:

#### 1. Backend Setup

```bash
cd 260001_be

# Restore packages
dotnet restore

# Apply database migrations
dotnet ef database update

# Run API server
dotnet run
```

**Backend will be available at:** `https://localhost:5001`

#### 2. Frontend Setup (New Terminal)

```bash
cd 260001_fe

# Install dependencies
npm install

# Run dev server
npm run dev
```

**Frontend will be available at:** `http://localhost:5173`

Access the app and login with real user credentials (via registration or test user).

---

## 📊 Architecture & Tech Stack

### Backend (ASP.NET Core 8)

| Component             | Technology                      | Purpose                  |
| --------------------- | ------------------------------- | ------------------------ |
| **API Framework**     | ASP.NET Core 8                  | RESTful API endpoints    |
| **Database**          | SQLite (dev), PostgreSQL (prod) | Persistent data storage  |
| **ORM**               | Entity Framework Core 8         | Data access & migrations |
| **Authentication**    | JWT (JSON Web Tokens)           | Stateless user sessions  |
| **API Documentation** | Swagger/OpenAPI                 | Auto-generated API docs  |

**Key Endpoints:**

```
POST   /api/auth/register      → Create user account
POST   /api/auth/login         → Get JWT token
GET    /api/jobs               → List all applications
POST   /api/jobs               → Create application
PUT    /api/jobs/{id}          → Update application
DELETE /api/jobs/{id}          → Delete application
GET    /api/periods            → List job search groups
POST   /api/periods            → Create group
```

### Frontend (React 18 + Vite)

| Component        | Technology      | Purpose                     |
| ---------------- | --------------- | --------------------------- |
| **UI Framework** | React 18        | Component-based UI          |
| **Build Tool**   | Vite            | Fast development & bundling |
| **Styling**      | Tailwind CSS    | Utility-first CSS           |
| **HTTP Client**  | Axios           | API communication           |
| **Routing**      | React Router v6 | Client-side navigation      |
| **State**        | React Context   | Theme management            |

**Key Features:**

- Mock data support for offline demo
- Automatic API fallback if backend unavailable
- Dark/light mode toggle
- Responsive mobile-first design
- localStorage persistence

### Deployment Architecture

```
                    ┌─────────────────────┐
                    │   Your Computer     │
                    │  (Local Development)│
                    ├─────────────────────┤
        ┌───────────┤ Backend (ASP.NET)   │
        │           │ Port: 5001/5000     │
        │           └─────────────────────┘
        │           ┌─────────────────────┐
        │           │ Frontend (React)    │
        │           │ Port: 5173          │
        │           └─────────────────────┘
        │
        │           ┌──────────────────┐
        └──────────→│   Production     │
                    ├──────────────────┤
                    │ Vercel (Frontend)│
                    │ your-site.vercel.app│
                    └──────────────────┘

Eventually:
                    ┌──────────────────┐
                    │  Backend Server  │
                    │ (Render, Railway)│
                    ├──────────────────┤
                    │ PostgreSQL       │
                    │ (Supabase, etc)  │
                    └──────────────────┘
```

---

## Mock Data System

The frontend includes a mock data system for **instant portfolio demos** without needing a backend.

### What's Included (By Default)

- **User Account:** `test@mail.com` / `jobtracker@janny`
- **Job Search Periods:**
  - 2026_Data
  - 2026_Software
- **10 Sample Job Applications:**
  - ✅ 2 "Applied" status
  - 📞 2 "In Progress" status
  - 🎤 2 "Interviewed" status
  - 🏆 2 "Offered" status
  - ❌ 2 "Rejected" status
- **Realistic Notes** on each application explaining status

### How It Works

1. **Frontend loads with `VITE_USE_MOCK_DATA=true`**
2. API client checks environment variable
3. If true, returns mock data from `src/data/mockData.js`
4. If false and backend unavailable, falls back to mock data
5. All CRUD operations work fully (stored in localStorage)

### Switching Between Mock & Real API

**Development (Local - Mock Data):**

```bash
# .env.local
VITE_USE_MOCK_DATA=true
VITE_API_URL=http://localhost:5000/api
```

**Production (Vercel - Mock Data):**

```env
VITE_USE_MOCK_DATA=true
VITE_API_URL=https://your-api.example.com/api  # Used if you deploy backend later
```

**With Real Backend:**

```env
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://your-backend.example.com/api
```

### Seed/Reset Mock Data

From browser console:

```javascript
// Load mock data into localStorage
import { seedMockData } from "./data/seedMockData";
seedMockData();

// Clear all mock data
import { clearMockData } from "./data/seedMockData";
clearMockData();
```

---

## Development Workflow

### Running Full Stack Locally

**Terminal 1 - Backend:**

```bash
cd 260001_be
dotnet run
```

**Terminal 2 - Frontend:**

```bash
cd 260001_fe
npm run dev
```

**Access Points:**

- Frontend: `http://localhost:5173`
- Backend API: `https://localhost:5001`
- Swagger docs: `https://localhost:5001/swagger`

### Testing Checklist

Once running:

1. ✅ **Register/Login**
   - Try creating new account or use `test@mail.com` / `jobtracker@janny`
2. ✅ **Create Job Application**
   - Fill form: Company, Job Title, Status, Notes
   - Click "Add Application"

3. ✅ **View Applications**
   - See jobs organized by groups
   - Expand/collapse groups

4. ✅ **Update Application**
   - Click pencil icon to edit
   - Change status and notes
   - Save changes

5. ✅ **Delete Application**
   - Click X icon
   - Confirm deletion

6. ✅ **Theme Toggle**
   - Use sun/moon icon in header
   - Verify dark mode works

---

## Production Deployment

### Frontend (Vercel) - **Recommended**

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete guide.

**Quick Steps:**

1. Push code to GitHub
2. Connect GitHub to Vercel
3. Set `VITE_USE_MOCK_DATA=true` environment variable
4. Deploy

**Result:** Live portfolio demo at `your-app.vercel.app` ✅

### Backend (Optional - For Future)

When ready to deploy backend separately:

1. **Database:** Migrate from SQLite to PostgreSQL
   - Supabase: Easy managed Postgres
   - Railway: Simple connection string setup
2. **Backend Hosting:**
   - Render: Free tier for .NET
   - Railway: Pay-as-you-go
   - Azure: Enterprise option

3. **Update Frontend:**
   - Set `VITE_USE_MOCK_DATA=false`
   - Set `VITE_API_URL=https://your-backend-url/api`
   - Redeploy to Vercel

---

## Database Management (Backend)

### SQLite (Development)

- **File:** `260001_be/JobTracker.db`
- **Auto-created** on first run with migrations
- **Connection String:** `appsettings.Development.json`

### Reset Database

```bash
cd 260001_be
dotnet ef database drop -f
dotnet ef database update
```

⚠️ **Warning:** This deletes all data!

### Create New Migration

After changing models:

```bash
cd 260001_be
dotnet ef migrations add YourMigrationName
dotnet ef database update
```

### PostgreSQL (Production)

[See production deployment guide for setup]

---

## Environment Configuration

### Frontend (.env.local)

```env
# Local development - use localhost
VITE_API_URL=http://localhost:5000/api

# Use mock data for demos
VITE_USE_MOCK_DATA=true
```

### Frontend (.env.production)

```env
# Vercel deployment - use mock data by default
VITE_USE_MOCK_DATA=true

# Optional: point to backend when deployed
# VITE_API_URL=https://your-backend.example.com/api
```

### Backend (appsettings.Development.json)

Automatically uses `JobTracker.db` for local SQLite development.

---

## Available Scripts

### Frontend

```bash
npm run dev       # Start dev server with Vite
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run lint      # Lint code (if configured)
```

### Backend

```bash
dotnet run          # Run with hot reload
dotnet build        # Compile project
dotnet clean        # Remove build artifacts
dotnet ef migrations add MyMigration  # Create migration
dotnet ef database update             # Apply migrations
dotnet publish -c Release -o publish  # Prepare for deployment
```

---

## Troubleshooting

### "Cannot connect to API" (Frontend)

**Check:**

1. Backend is running: `dotnet run` in `260001_be`
2. Frontend .env points to correct API: `VITE_API_URL=http://localhost:5000/api`
3. CORS is enabled in `Program.cs`

**Solution:**

```bash
# Restart backend
cd 260001_be
dotnet run

# Check browser console for exact error
```

### "SQLite Error 14: unable to open database file"

**Cause:** Wrong path in connection string

**Solution:**

```bash
cd 260001_be

# Ensure Development environment
$env:ASPNETCORE_ENVIRONMENT="Development"

# Run (creates database)
dotnet run
```

### "npm ERR! Cannot find module"

**Solution:**

```bash
cd 260001_fe
rm package-lock.json node_modules -r
npm install
npm run dev
```

### ".NET version mismatch"

**Check:**

```bash
dotnet --version
```

Must be 8.0+. [Download here](https://dotnet.microsoft.com/download)

### Mock Data Not Loading

**Check localStorage in browser console:**

```javascript
JSON.parse(localStorage.getItem("mock_jobs"));
JSON.parse(localStorage.getItem("mock_groups"));
```

**If empty, seed from console:**

```javascript
import { seedMockData } from "./src/data/seedMockData.js";
seedMockData();
```

---

## API Endpoints Reference

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Create user account |
| POST   | `/api/auth/login`    | Get JWT token       |

### Job Applications

| Method | Endpoint         | Description           |
| ------ | ---------------- | --------------------- |
| GET    | `/api/jobs`      | List all applications |
| GET    | `/api/jobs/{id}` | Get one application   |
| POST   | `/api/jobs`      | Create application    |
| PUT    | `/api/jobs/{id}` | Update application    |
| DELETE | `/api/jobs/{id}` | Delete application    |

### Job Search Groups (Periods)

| Method | Endpoint            | Description     |
| ------ | ------------------- | --------------- |
| GET    | `/api/periods`      | List all groups |
| GET    | `/api/periods/{id}` | Get one group   |
| POST   | `/api/periods`      | Create group    |
| PUT    | `/api/periods/{id}` | Update group    |
| DELETE | `/api/periods/{id}` | Delete group    |

**Swagger UI:** `https://localhost:5001/swagger` (when backend running)

---

## 📚 Next Steps

### For Portfolio (Right Now)

1. ✅ **Run locally and verify it works:**

   ```bash
   cd 260001_fe
   npm install
   npm run dev
   ```

2. ✅ **Test with mock data:**
   - Login: `test@mail.com` / `jobtracker@janny`
   - Create, update, delete jobs
   - Try dark mode

3. ✅ **Deploy to Vercel:**
   - Follow [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
   - Get live link
   - Share with recruiters

4. ✅ **Update resume/LinkedIn:**
   - Add live link
   - Describe the project
   - Highlight technologies

### For Future Enhancements

- [ ] Deploy backend to Render or Railway
- [ ] Migrate from SQLite to PostgreSQL
- [ ] Add email notifications for application updates
- [ ] Implement job search analytics/dashboard
- [ ] Add calendar integration for interview dates
- [ ] Multi-user collaboration features

---

## Project Statistics

| Aspect               | Details                                       |
| -------------------- | --------------------------------------------- |
| **Backend LOC**      | ~800 lines (Controllers, Models, Migrations)  |
| **Frontend LOC**     | ~1200 lines (Components, API, Styles)         |
| **Key Dependencies** | ASP.NET Core 8, React 18, Tailwind CSS, Axios |
| **Database**         | SQLite (dev), PostgreSQL-ready (prod)         |
| **API Endpoints**    | 11 RESTful endpoints with JWT auth            |
| **Dev Time**         | ~4-5 hours end-to-end                         |
| **Deployment Time**  | ~10 minutes to Vercel                         |

---

## Architectural Decisions

### Why ASP.NET Core?

- Modern, high-performance framework
- First-class Entity Framework Core support
- Built-in JWT authentication
- Excellent for portfolio projects (industry relevant)

### Why React + Vite?

- Industry standard for frontend
- Vite provides instant dev server startup
- Smaller bundle size than Create React App
- Great developer experience

### Why Mock Data?

- **Portfolio-ready** without backend infrastructure
- **Instant demo** for interviewers
- **Lower risk** (no deployment failures waiting on DB)
- **Faster iteration** during development

### Why Vercel?

- **Free hosting** with automatic deployments
- **Global CDN** for performance
- **Git integration** for continuous deployment
- **Zero configuration** for React/Vite apps

---

## Code Quality & Best Practices

### Backend

- ✅ Separation of concerns (Controllers, Models, Data, Mappers)
- ✅ Entity Framework Core async/await patterns
- ✅ JWT token-based authentication
- ✅ Database migrations for schema versioning
- ✅ DTO pattern for API serialization

### Frontend

- ✅ Component-based architecture
- ✅ Proper API abstraction layer
- ✅ Environment-based configuration
- ✅ Mock data support with fallback
- ✅ Context API for state (theme)
- ✅ Responsive Tailwind CSS design
- ✅ Error handling in API calls

---

## Credits & Resources

### Tutorials Used

- [Microsoft ASP.NET Core Docs](https://learn.microsoft.com/en-us/aspnet/core)
- [React Official Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

### Tools

- **VS Code** - Code editor
- **Git** - Version control
- **Vercel** - Frontend hosting
- **SQLite** - Local database

---

## License

This project is open source and available under the MIT License.

---

## 💡 Tips for Interviews

**When discussing this project, highlight:**

1. **Full-stack capability** - You designed and built both frontend and backend
2. **Database design** - Explain the schema (Users, JobApplications, Periods)
3. **Authentication** - JWT tokens and token refresh strategies
4. **API design** - RESTful principles and endpoint organization
5. **Responsive UI** - Mobile-first design with Tailwind CSS
6. **Deployment strategy** - Why you chose Vercel + mock data approach
7. **Scalability** - How you'd migrate to PostgreSQL and scale backend

**Questions you might get:**

- _"How would you handle 100,000 job applications?"_
  → Database indexing on userId and status, pagination, caching with Redis

- _"How would you deploy the backend?"_
  → Containerize with Docker, deploy to Render/Railway/AWS, use PostgreSQL on Supabase

- _"How would you test this?"_
  → Unit tests with xUnit (backend), Jest (frontend), integration tests for API

- _"What's your deployment strategy?"_
  → CI/CD with GitHub Actions, automated tests on PR, staging environment before production

---

**Made with ❤️ for your portfolio**

Last Updated: March 2026
