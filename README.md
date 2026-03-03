# Job Tracker Application

A full-stack job tracking application built with ASP.NET Core backend and React frontend. Track job applications, organize them into groups (periods), and monitor your job search progress.

## Project Structure

```
260001_Job_Tracker/
├── 260001_be/          # Backend (ASP.NET Core API)
├── 260001_fe/          # Frontend (React + Vite)
├── 260001_Job_Tracker.sln  # Visual Studio solution
└── README.md
```

## Prerequisites

### Backend Requirements

- **.NET 8.0** or higher
- SQLite (included with .NET)

### Frontend Requirements

- **Node.js** 16+ and **npm** or **yarn**

### General Tools

- **Git**
- **Visual Studio Code** or **Visual Studio** (optional, but recommended)

## Getting Started

### 1. Clone and Navigate to Project

```bash
cd 260001_Job_Tracker
```

### 2. Backend Setup (ASP.NET Core)

#### Navigate to backend directory

```bash
cd 260001_be
```

#### Restore NuGet packages

```bash
dotnet restore
```

#### Apply database migrations

```bash
dotnet ef database update
```

This will create the SQLite database with all required tables.

#### Run the backend server

```bash
dotnet run
```

The API will be available at `https://localhost:5001` (or the port shown in console).

### 3. Frontend Setup (React)

#### In a new terminal, navigate to frontend directory

```bash
cd 260001_fe
```

#### Install dependencies

```bash
npm install
```

#### Run the development server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in console).

#### Build for production

```bash
npm run build
```

## Development Workflow

### Running Both Services

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

Once both are running:

- Frontend: `http://localhost:5173`
- Backend API: `https://localhost:5001`

The frontend is configured to communicate with the backend API automatically.

### Quick Testing Guide

Once the application is running, you can test it with the following steps:

1. **Open the frontend** in your browser: `http://localhost:5173`
2. **Register or Login** with the test credentials:
   - Email: `test@mail.com`
   - Password: `123456`
3. **Add a Job Application:**
   - Fill in the form on the left side with:
     - Company Name (e.g., Google, Microsoft)
     - Job Title (e.g., Software Engineer)
     - Status (Applied, Interviewing, Offered, Accepted, Rejected)
     - Other optional fields
   - Click "Add Application"
4. **View Applications:**
   - Jobs appear on the right side organized by groups
   - Click the expand arrow to see jobs in each group
5. **Manage Jobs:**
   - Click the pencil icon to edit a job
   - Click the X icon to delete a job
   - Change the status and other details as needed
6. **Theme Toggle:**
   - Use the sun/moon icon in the header to switch between light and dark themes

## Building for Production

### Backend Build

```bash
cd 260001_be
dotnet build -c Release
dotnet publish -c Release -o ./publish
```

### Frontend Build

```bash
cd 260001_fe
npm run build
```

The production-ready files will be in `260001_fe/dist/`.

## Database

### Database Location

- SQLite database is stored locally in the backend directory
- File: `jobtracker.db` (created after first migration)

### Reset Database

To reset the database and start fresh:

```bash
cd 260001_be
dotnet ef database drop -f
dotnet ef database update
```

**Warning:** This will delete all data!

### Migrations

To create a new migration after changing models:

```bash
cd 260001_be
dotnet ef migrations add YourMigrationName
dotnet ef database update
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Job Applications Endpoints

- `GET /api/jobs` - Get all job applications
- `POST /api/jobs` - Create new job application
- `PUT /api/jobs/{id}` - Update job application
- `DELETE /api/jobs/{id}` - Delete job application

### Groups/Periods Endpoints

- `GET /api/periods` - Get all groups/periods
- `POST /api/periods` - Create new group
- `PUT /api/periods/{id}` - Update group
- `DELETE /api/periods/{id}` - Delete group

## Available Scripts

### Frontend Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Commands

```bash
dotnet run                    # Run development server
dotnet build                  # Build the project
dotnet test                   # Run tests (if available)
dotnet ef migrations add      # Create new migration
dotnet ef database update     # Apply migrations
```

## Troubleshooting

### "Port already in use" error

- Change the port in `appsettings.json` (backend) or `vite.config.js` (frontend)
- Or kill the process using the port

### Database connection error

```bash
cd 260001_be
dotnet ef database update
```

### CORS errors (Frontend can't reach Backend)

- Ensure both services are running
- Check that the API URL in frontend is correct
- Verify CORS is enabled in `Program.cs`

### Frontend dependency issues

```bash
cd 260001_fe
rm -r node_modules
npm install
```

### .NET version mismatch

Verify your .NET version:

```bash
dotnet --version
```

Should be 8.0 or higher. Install from: https://dotnet.microsoft.com/download

## Default Credentials

You can test the application with the following credentials:

**Test User:**

- **Email:** test@mail.com
- **Password:** 123456

If the test user doesn't exist in the database, you can register using these credentials through the registration page.

## Features

- ✅ User authentication with JWT
- ✅ Create, read, update, delete job applications
- ✅ Organize jobs into groups/periods
- ✅ Track application status (Applied, Interview, Offer, Rejected, Accepted)
- ✅ View job statistics and progress
- ✅ Responsive design for mobile and desktop

## Support

For issues or questions, refer to the documentation in the `Temp/` folder or create an issue in the repository.

## License

[Specify your license here]
