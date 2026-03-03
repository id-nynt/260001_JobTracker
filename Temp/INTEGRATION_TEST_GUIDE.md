# Frontend-Backend Integration Test Guide

## Setup Status

✅ **Backend**: Running on http://localhost:5000

- Swagger UI available at http://localhost:5000/swagger/index.html
- SQLite database connected

✅ **Frontend**: Running on http://localhost:3001

- React + Vite development server
- Tailwind CSS configured
- API client configured to connect to backend

## Integration Points

### 1. **API Configuration**

- Frontend API base URL: `http://localhost:5000/api`
- Vite proxy configured for `/api` routes
- Axios client ready in `src/api/jobAPI.js`

### 2. **Frontend Components Connected**

- **App.jsx**: Fetches jobs on mount, manages state with API calls
- **JobForm.jsx**: POSTs new jobs to backend
- **JobCard.jsx**: Handles PUT updates and DELETE operations
- **JobList.jsx**: Displays jobs and statistics

## Test Scenarios

### Test 1: Create a Job Application

1. Go to http://localhost:3001
2. Fill out the form:
   - Company Name: `Google`
   - Job Title: `Senior Software Engineer`
   - Job URL: `https://careers.google.com/jobs`
   - Date Applied: (today's date)
   - Status: `Applied`
   - Notes: `Test application`
3. Click "Add Application"
4. Expected: Job appears at the top of the list, database is updated

### Test 2: View Statistics

1. After creating a few jobs, check the stats cards below the form
2. Expected:
   - Total count increases
   - Applied count increases
   - Cards show updated counts in blue, yellow, green colors

### Test 3: Update a Job

1. Click "Edit" on any job card
2. Change the status to "Interview"
3. Click "Save"
4. Expected: Status badge updates, backend database updated

### Test 4: Delete a Job

1. Click "Delete" on any job card
2. Confirm deletion
3. Expected: Job removed from list, database updated

### Test 5: Refresh Page

1. Create a few jobs
2. Refresh the page (F5)
3. Expected: Jobs persist (loaded from database)

### Test 6: API Error Handling

1. Stop the backend server
2. Try to add/edit/delete a job
3. Expected: Error message displayed to user
4. Restart backend to resume

## Backend API Endpoints

Test via Swagger at: http://localhost:5000/swagger/index.html

- **GET** /api/jobs - Fetch all jobs
- **GET** /api/jobs/{id} - Fetch specific job
- **POST** /api/jobs - Create new job
- **PUT** /api/jobs/{id} - Update job
- **DELETE** /api/jobs/{id} - Delete job

## File Structure

```
260001_fe/
├── src/
│   ├── App.jsx                  (Main component with API integration)
│   ├── main.jsx                 (Entry point)
│   ├── api/
│   │   └── jobAPI.js           (API client with axios)
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── JobForm.jsx         (Integrated with API)
│   │   ├── JobList.jsx
│   │   └── JobCard.jsx         (Integrated with API)
│   └── styles/
│       └── index.css           (Tailwind CSS)
│
260001_be/
├── Models/
│   └── JobApplication.cs
├── Controllers/
│   └── JobsController.cs
├── Data/
│   ├── JobTrackerDbContext.cs
│   └── Migrations/
├── DTOs/
│   └── JobApplicationDto.cs
├── Program.cs                   (ASP.NET configuration)
└── JobTracker.db               (SQLite database)
```

## Next Steps (Optional Enhancements)

1. **Authentication**: Add user authentication
2. **Validation**: Enhanced client and server validation
3. **Search/Filter**: Filter jobs by status, company, etc.
4. **Pagination**: Handle large job lists
5. **Deployment**: Deploy to production (Vercel for frontend, Azure for backend)
