# Job Tracker Application

A clean, simple web application to organize and track your job applications. Keep everything in one place—apply, interview, get offered, get rejected. It all goes here.

Perfect for job seekers managing multiple applications across different companies or roles.

## What It Does

- 📝 **Add job applications** - Company, title, date applied, and notes
- 📊 **Organize by groups** - Create custom job search "periods" (e.g., "2026_Tech", "2026_Data")
- 🏷️ **Track status** - Mark applications as Applied, Interviewing, Offered, Accepted, or Rejected
- 🎨 **Dark/Light mode** - Easy on the eyes, day or night
- 📱 **Works anywhere** - Responsive design for desktop, tablet, and mobile
- 🚀 **Try instantly** - Comes with mock data—no setup required

## Quick Start

### Try It Right Now (2 minutes)

Just want to see it in action? The app includes sample data so you can explore immediately:

```bash
cd 260001_fe
npm install
npm run dev
```

Visit `http://localhost:3000` and login with:

- **Email:** `test@mail.com`
- **Password:** `jobtracker@janny`

You'll see 10 sample job applications already loaded in the system.

### Run with Backend (5 minutes)

For a full-stack experience with real data storage:

**Terminal 1 - Start the backend:**

```bash
cd 260001_be
docker compose -f ../docker-compose.yml up -d db
dotnet user-secrets set "Jwt:Secret" "<random string, 32+ characters>"
dotnet run   # applies migrations on startup
```

**Terminal 2 - Start the frontend:**

```bash
cd 260001_fe
npm install
npm run dev
```

Then open `http://localhost:3000` and register a new account.

---

## Features in Detail

### 📋 Job Application Management

- **Add** new applications with company, job title, date, and notes
- **Edit** applications to update status or add interview feedback
- **Delete** applications when you want to clean up
- **Organize** by custom groups (recruiting periods, company types, etc.)

### 🏷️ Status Tracking

Track each application through its lifecycle:

| Status           | Color  | Meaning                               |
| ---------------- | ------ | ------------------------------------- |
| **Applied**      | Blue   | Just submitted the application        |
| **Interviewing** | Yellow | In the interview process              |
| **Offered**      | Teal   | Got an offer!                         |
| **Accepted**     | Green  | You accepted—you're going!            |
| **Rejected**     | Red    | Didn't work out (note for next time!) |

### 🌙 Dark Mode

Toggle between light and dark themes with the sun/moon icon. Your preference is saved automatically.

### 📱 Responsive Design

- Full-featured on desktop
- Mobile-friendly interface
- Touch-friendly buttons and forms

---

## Tech Stack

- **Backend:** ASP.NET Core 8, Entity Framework Core, JWT authentication
- **Frontend:** React 18, Vite, Tailwind CSS, Axios
- **Database:** PostgreSQL (local via Docker Compose)
- **Mock Data:** Built-in sample data for instant demos

---

## Sample Data Included

Login with the pre-loaded test account to see it in action:

**Email:** `test@mail.com`  
**Password:** `jobtracker@janny`

You'll see:

- 2 job search periods (2026_Data, 2026_Software)
- 10 realistic job applications
- All 5 status types represented
- Genuine notes explaining each application's status

All data is stored in your browser's local storage—no backend required to try it.

---

## Installation

### Requirements

- **Node.js** 16+ ([Download](https://nodejs.org))
- **.NET 8.0+** ([Download](https://dotnet.microsoft.com/download)) - _optional, only if running backend_
- **Git** ([Download](https://git-scm.com))

### Frontend Only

Perfect if you just want to see the app in action:

```bash
cd 260001_fe
npm install
npm run dev
```

App runs at `http://localhost:3000`

### Full Stack (Frontend + Backend)

If you want to use a real database and backend:

```bash
# Backend (Terminal 1)
cd 260001_be
docker compose -f ../docker-compose.yml up -d db
dotnet user-secrets set "Jwt:Secret" "<random string, 32+ characters>"
dotnet run   # applies migrations on startup

# Frontend (Terminal 2)
cd 260001_fe
npm install
npm run dev
```

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000`
- **Swagger Docs:** `http://localhost:5000/swagger`

---

## How to Use

### Adding an Application

1. Fill in the form on the left:
   - Company Name
   - Job Title
   - Date Applied
   - Status
   - Any notes about the role
2. Click "Add Application"
3. Your application appears in the list

### Organizing by Groups

1. Applications are grouped by "job search periods"
2. Click a group to expand/collapse it
3. Create new groups or rename existing ones by clicking on the group title

### Editing & Deleting

- **Edit:** Click the pencil icon on any application
- **Delete:** Click the X icon (confirmations prevent accidents)

### Switching Themes

Click the sun/moon icon in the top-right corner to toggle dark mode.

---

## Project Structure

```
260001_Job_Tracker/
├── 260001_be/                 # Backend (ASP.NET Core 8)
│   ├── Controllers/           # API endpoints
│   ├── Models/                # Database models
│   ├── Data/                  # Database context
│   ├── Migrations/            # Database schema
│   ├── DTOs/                  # Data transfer objects
│   └── Program.cs             # API setup
│
├── 260001_fe/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── api/               # API client
│   │   ├── data/              # Mock data
│   │   └── styles/            # Tailwind CSS
│   ├── package.json           # Dependencies
│   └── vite.config.js         # Build config
│
└── README.md                   # This file
```

---

## API Overview

**Backend endpoints:**

```
Authentication:
  POST /api/auth/register    - Create account
  POST /api/auth/login       - Login

Job Applications:
  GET    /api/jobs           - List all applications
  POST   /api/jobs           - Add application
  PUT    /api/jobs/{id}      - Update application
  DELETE /api/jobs/{id}      - Delete application

Groups:
  GET    /api/periods        - List groups
  POST   /api/periods        - Create group
  PUT    /api/periods/{id}   - Update group
  DELETE /api/periods/{id}   - Delete group
```

See Swagger UI at `http://localhost:5000/swagger` when running the backend.

---

## Troubleshooting

### "Port already in use"

Something is already using port 3000 or 5000. Either close that application or change the port in the config.

### "Cannot find module" error

```bash
cd 260001_fe
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "Database file not found" error

The database is created automatically on first run:

```bash
cd 260001_be
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet ef database update
dotnet run
```

### ".NET version error"

Check your version:

```bash
dotnet --version  # Must be 8.0 or higher
```

---

## Deployment

The frontend can be deployed for free to **Vercel**, **Netlify**, **GitHub Pages**, or any static hosting:

1. Build: `cd 260001_fe && npm run build`
2. Upload the `dist/` folder to your hosting provider
3. Done!

---

## Customization

The codebase is clean and straightforward:

- **Add new statuses** - Edit `JobForm.jsx` and `JobCard.jsx`
- **Change colors** - Modify Tailwind config or CSS
- **Add fields** - Update database models and API
- **Change theme colors** - Edit `ThemeContext.jsx`

---

## Contributing

Found a bug or have an idea? Feel free to:

1. Fork this repo
2. Create a feature branch
3. Submit a pull request

---

## Questions?

- **How do I export my data?** - Data is stored in your browser (localStorage) or database. You can download it manually or copy from the UI.
- **Is my data secure?** - If running locally, yes (it's on your machine). In production, use HTTPS and secure authentication.
- **Can I run this offline?** - Frontend runs completely offline with mock data enabled.
- **Can multiple people use this?** - Yes! Deploy the backend and multiple users can login with their own accounts.

---

**Happy job hunting!** 🎯

Last Updated: March 2026
