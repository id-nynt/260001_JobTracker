# Job Tracker - Development Guide

**Project**: Job Application Tracker  
**Tech Stack**: ASP.NET Core 8 (Backend), React 18 + Tailwind CSS (Frontend), SQLite (Database)  
**Last Updated**: January 9, 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design](#architecture--design)
3. [Systematic Feature Development Workflow](#systematic-feature-development-workflow)
4. [Backend Development Workflow](#backend-development-workflow)
5. [Frontend Development Workflow](#frontend-development-workflow)
6. [Component-by-Component Development](#component-by-component-development)
7. [Testing Strategy](#testing-strategy)
8. [Deployment](#deployment)
9. [Common Issues & Solutions](#common-issues--solutions)

---

## Project Overview

### What is Job Tracker?

A full-stack web application for tracking job applications with:

- **User Authentication**: Register, login with JWT tokens
- **Group Management**: Organize applications by groups/periods
- **Job Application Tracking**: Add, edit, delete job applications
- **Responsive UI**: Grayscale design with blue accents

### Key Features

- ✅ User registration & login with secure password hashing (BCrypt)
- ✅ Group-based organization for job applications
- ✅ Complete CRUD operations for jobs and groups
- ✅ Auto-created "Default" group for every user
- ✅ Date tracking (dd/mm/yyyy format)
- ✅ Application status tracking (Applied, Interview, Offer, Rejected, Accepted)
- ✅ Responsive React UI with Tailwind CSS styling
- ✅ Professional footer with contact information

---

## Architecture & Design

### Database Schema

```
Users
  ├─ Id (PK)
  ├─ Email (Unique)
  ├─ Username (Unique)
  ├─ PasswordHash (BCrypt)
  ├─ CreatedAt
  └─ UpdatedAt

Periods (Groups)
  ├─ Id (PK)
  ├─ Name
  ├─ DateStart (nullable)
  ├─ DateEnd (nullable)
  ├─ CreatedAt
  └─ UpdatedAt

JobApplications
  ├─ Id (PK)
  ├─ CompanyName
  ├─ JobTitle
  ├─ JobUrl (nullable)
  ├─ Status
  ├─ DateApplied
  ├─ Notes (nullable)
  ├─ PeriodId (FK → Periods)
  ├─ CreatedAt
  └─ UpdatedAt
```

### API Endpoints Overview

**Authentication**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)

**Groups (Periods)**

- `GET /api/periods` - Get all groups
- `POST /api/periods` - Create new group
- `PUT /api/periods/{id}` - Update group
- `DELETE /api/periods/{id}` - Delete group

**Jobs (JobApplications)**

- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/{id}` - Update job
- `DELETE /api/jobs/{id}` - Delete job

### Frontend Component Structure

```
App.jsx (Main routing & auth management)
  ├─ Login.jsx
  ├─ Register.jsx
  └─ Dashboard (Protected)
      ├─ Header.jsx (User info + Logout)
      ├─ JobForm.jsx (New application form)
      ├─ JobList.jsx (Display all applications)
      │   └─ GroupCard.jsx (Collapsible group container)
      │       └─ JobCard.jsx (Individual job card)
      ├─ SimpleGroupControl.jsx (Create new group dropdown)
      └─ Footer.jsx (Contact information)
```

---

## Systematic Feature Development Workflow

This section provides a **real-world, step-by-step approach** for developing features systematically. Follow this order to build features with minimal errors and maximum code reusability.

### Core Development Cycle

For any new entity/feature, follow this progression:

```
1. Define Core Entity (Model)
   ↓
2. Create Database Layer (DbContext, Migration)
   ↓
3. Define Data Transfer Objects (DTOs)
   ↓
4. Create Mapper Layer (Entity ↔ DTO conversion)
   ↓
5. Implement Business Logic (Services/Entity Methods)
   ↓
6. Build API Controller (Endpoints with error handling)
   ↓
7. Create Frontend API Service
   ↓
8. Build React Components (Display, Form, List)
   ↓
9. Add Styling & UX Enhancements
```

### Step-by-Step Example: Adding a New Feature

#### Scenario: Add "Interview Notes" tracking to Job Applications

---

#### **Phase 1: Backend - Core Entity & Database**

##### Step 1.1: Design the Entity

```csharp
// Models/JobApplication.cs - Add to existing entity
public sealed class JobApplication
{
    // ... existing properties ...

    // New property
    public string? InterviewNotes { get; set; }

    // New method (rich entity pattern)
    public void UpdateInterviewNotes(string? notes)
    {
        InterviewNotes = notes;
        UpdatedAt = DateTime.UtcNow;
    }
}
```

**Guidelines:**

- Keep entities focused (single responsibility)
- Include business logic as methods, not just properties
- Add timestamps (CreatedAt, UpdatedAt) for audit trail
- Use nullable types (?) for optional fields
- Include validation in methods

##### Step 1.2: Create Database Migration

```bash
# In 260001_be/ directory
dotnet ef migrations add AddInterviewNotesToJobApplications
dotnet ef database update
```

The migration is auto-generated. Review if needed:

- Check it adds the column correctly
- Verify nullable handling
- Ensure foreign keys intact

---

#### **Phase 2: Backend - Data Transfer Layer**

##### Step 2.1: Create/Update DTOs

```csharp
// DTOs/JobApplicationDto.cs
public class JobApplicationDto
{
    // ... existing properties ...
    public string? InterviewNotes { get; set; }
}

// DTOs/UpdateJobApplicationDto.cs - For update requests
public class UpdateJobApplicationDto
{
    // ... existing properties ...
    public string? InterviewNotes { get; set; }
}
```

**Guidelines:**

- DTOs define what clients see/send
- Keep separate request (input) and response (output) DTOs
- Don't expose internal IDs or sensitive data
- Mirror entity properties (with possible filtering)

##### Step 2.2: Create/Update Mapper

```csharp
// Mappers/JobApplicationMapper.cs
public static class JobApplicationMapper
{
    public static JobApplicationDto ToDto(JobApplication entity)
    {
        return new JobApplicationDto
        {
            Id = entity.Id,
            CompanyName = entity.CompanyName,
            JobTitle = entity.JobTitle,
            // ... other properties ...
            InterviewNotes = entity.InterviewNotes
        };
    }

    // Other mapping methods...
}
```

**Guidelines:**

- Keep mapping logic separate from business logic
- Mapper converts entities to DTOs for API responses
- Mapper converts DTOs to entities using factory methods
- Reuse mappers across all controllers

---

#### **Phase 3: Backend - Business Logic**

##### Step 3.1: Add Service Layer (Optional but Recommended)

```csharp
// Services/JobApplicationService.cs
public class JobApplicationService
{
    private readonly JobTrackerDbContext _context;

    public JobApplicationService(JobTrackerDbContext context)
    {
        _context = context;
    }

    public async Task UpdateInterviewNotesAsync(int jobId, string? notes)
    {
        var job = await _context.JobApplications.FindAsync(jobId);
        if (job == null)
            throw new InvalidOperationException("Job not found");

        job.UpdateInterviewNotes(notes);
        await _context.SaveChangesAsync();
    }
}
```

**Guidelines:**

- Service encapsulates business logic
- Service handles validation and error checking
- Service manages database transactions
- Inject services into controllers

##### Step 3.2: Register Service in Dependency Injection

```csharp
// Program.cs
services.AddScoped<JobApplicationService>();
```

---

#### **Phase 4: Backend - API Controller**

##### Step 4.1: Add Controller Method

```csharp
// Controllers/JobsController.cs
[HttpPut("{id}/interview-notes")]
[Authorize]
public async Task<ActionResult<JobApplicationDto>> UpdateInterviewNotes(
    int id,
    [FromBody] UpdateInterviewNotesRequest request)
{
    try
    {
        if (string.IsNullOrWhiteSpace(request.Notes) && request.Notes != null)
            return BadRequest(new { error = "Notes cannot be whitespace-only" });

        await _jobService.UpdateInterviewNotesAsync(id, request.Notes);

        var job = await _context.JobApplications.FindAsync(id);
        return Ok(JobApplicationMapper.ToDto(job));
    }
    catch (InvalidOperationException ex)
    {
        _logger.LogWarning(ex, "Job not found: {JobId}", id);
        return NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error updating interview notes for job {JobId}", id);
        return StatusCode(500, "An error occurred while updating notes");
    }
}
```

**Guidelines:**

- Always validate input parameters
- Use appropriate HTTP status codes
- Include error handling with logging
- Return mapped DTOs, never raw entities
- Use [Authorize] for protected endpoints

---

#### **Phase 5: Frontend - API Service**

##### Step 5.1: Create API Service Method

```javascript
// src/api/jobAPI.js
export const jobAPI = {
  // ... existing methods ...

  updateInterviewNotes: (jobId, notes) =>
    apiClient.put(`/jobs/${jobId}/interview-notes`, { notes }),
};
```

**Guidelines:**

- Keep API calls in separate service files
- Use consistent naming conventions
- Return promises (axios handles this)
- Handle errors at component level

---

#### **Phase 6: Frontend - React Components**

##### Step 6.1: Update Form Component

```jsx
// src/components/JobForm.jsx
function JobForm({ job, onSubmit }) {
  const [formData, setFormData] = useState({
    // ... existing fields ...
    interviewNotes: job?.interviewNotes || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... existing fields ... */}

      <div>
        <label className="block text-gray-300 mb-2">Interview Notes</label>
        <textarea
          name="interviewNotes"
          value={formData.interviewNotes}
          onChange={handleChange}
          placeholder="Notes from interviews..."
          className="input-field min-h-24"
        />
      </div>

      <button type="submit">Save</button>
    </form>
  );
}
```

##### Step 6.2: Display in Job Card

```jsx
// src/components/JobCard.jsx
function JobCard({ job, onEdit, onDelete }) {
  const [editMode, setEditMode] = useState(false);

  if (editMode) {
    return <JobForm job={job} onSubmit={handleUpdate} />;
  }

  return (
    <div className="card">
      <h3>
        {job.companyName} - {job.jobTitle}
      </h3>
      <p className="text-gray-400">Status: {job.status}</p>

      {job.interviewNotes && (
        <div className="mt-4 p-2 bg-gray-600 rounded">
          <p className="text-sm text-gray-300">Interview Notes:</p>
          <p className="text-white">{job.interviewNotes}</p>
        </div>
      )}

      <button onClick={() => setEditMode(true)}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}
```

**Guidelines:**

- Components display data and handle user interactions
- Keep components focused on presentation
- Pass data via props, actions via callbacks
- Use state for temporary UI state only

---

#### **Phase 7: Testing Your Implementation**

##### Backend Testing

```bash
# 1. Verify migration applied
cd 260001_be
dotnet build

# 2. Start backend
dotnet run

# 3. Test in Swagger UI
# http://localhost:5000/swagger
# - Try PUT /api/jobs/{id}/interview-notes
# - Send: { "notes": "Good fit for team" }
```

##### Frontend Testing

```bash
# 1. Start frontend
cd 260001_fe
npm run dev

# 2. In browser (http://localhost:3000)
# - Create a new job application
# - Edit job and add interview notes
# - Verify notes display on job card
# - Verify notes persist after refresh
```

---

### Development Checklist for New Features

Use this checklist when adding any new feature:

#### Backend Checklist

- [ ] Entity model defined with all properties and validation methods
- [ ] Migration created and applied to database
- [ ] DTOs created for request and response
- [ ] Mapper methods created (ToDto, FromDto, etc.)
- [ ] Service layer implemented (if business logic needed)
- [ ] Controller endpoint(s) implemented with error handling
- [ ] Validation added for user input
- [ ] Proper HTTP status codes returned
- [ ] Error messages logged
- [ ] Tested in Swagger UI
- [ ] Tested with invalid inputs
- [ ] Authorization checks added ([Authorize] attribute)

#### Frontend Checklist

- [ ] API service method created
- [ ] React component created/updated
- [ ] Props defined and documented
- [ ] State management logic added
- [ ] Error handling implemented
- [ ] Loading states shown to user
- [ ] Form validation added
- [ ] Styling applied (Tailwind classes)
- [ ] Responsive design tested
- [ ] Manual testing in browser
- [ ] Console checked for errors
- [ ] Network tab checked for failed requests

---

### Real-World Development Tips

#### 1. **Work Backend-First**

- Fully implement backend before touching frontend
- Test backend thoroughly with Swagger
- This prevents rework when API changes

#### 2. **Incremental Development**

- Build ONE feature at a time
- Don't try to add multiple features simultaneously
- Test after each phase
- Commit to version control frequently

#### 3. **Reusable Components**

- Extract common logic into services
- Create reusable mappers
- Use component composition
- Avoid code duplication

#### 4. **Error Handling**

- Always wrap database operations in try-catch
- Log errors with context
- Return meaningful error messages to client
- Handle edge cases (null, empty, invalid data)

#### 5. **Database Migrations**

```bash
# Always check migration before applying
dotnet ef migrations list

# If something goes wrong
dotnet ef database update [PreviousMigration]  # Rollback
dotnet ef migrations remove                     # Remove last migration
```

#### 6. **Version Control Workflow**

```bash
# Before coding a feature
git pull                                    # Get latest changes

# After implementing a feature phase
git add .
git commit -m "Feature: [Entity] - [What changed]"

# Example commits:
# "Feature: JobApplication - Add interview notes field and migration"
# "Feature: JobApplication - Create mappers and DTOs"
# "Feature: JobApplication - Add controller endpoint"
# "Feature: JobApplication - Add React form component"
```

---

## Backend Development Workflow

### Environment Setup

**Prerequisites**

- .NET 8 SDK installed
- Visual Studio 2022 (recommended) or VS Code
- SQLite3 (included with .NET)

**Initial Setup**

```bash
# Clone/navigate to backend folder
cd 260001_be

# Restore NuGet packages
dotnet restore

# Build project
dotnet build

# Apply migrations (creates database)
dotnet ef database update

# Run application
dotnet run
# API runs on: https://localhost:5000
# Swagger UI: https://localhost:5000/swagger
```

### Development Guidelines

#### 1. Creating a New API Endpoint

**Step-by-Step Process:**

1. **Define the Model** (if needed)

   ```
   Location: Models/
   Naming: PascalCase
   Properties: Include CreatedAt, UpdatedAt for audit trail
   Navigation: Include FK and navigation properties
   ```

2. **Create the Controller**

   ```
   Location: Controllers/
   Naming: [Entity]Controller.cs
   Base Class: ControllerBase with [ApiController]
   Route: [Route("api/[controller]")]
   Add [Authorize] for protected endpoints
   ```

3. **Add DbSet to Context**

   ```csharp
   // JobTrackerDbContext.cs
   public DbSet<YourModel> YourModels { get; set; }
   ```

4. **Create Migration**

   ```bash
   dotnet ef migrations add [MigrationName]
   dotnet ef database update
   ```

5. **Test with Swagger**
   - Open https://localhost:5000/swagger
   - Test endpoint directly in UI
   - Check response codes and data

**Example: Add a new endpoint**

```csharp
[HttpGet("{id}")]
[Authorize]
public async Task<ActionResult<JobApplicationDto>> GetJob(int id)
{
    var job = await _context.JobApplications.FindAsync(id);
    if (job == null)
        return NotFound(new { message = "Job not found" });

    return Ok(new JobApplicationDto
    {
        Id = job.Id,
        CompanyName = job.CompanyName,
        // ... map other properties
    });
}
```

#### 2. Error Handling & Validation

**Best Practices:**

- Validate input parameters before processing
- Return meaningful error messages
- Use appropriate HTTP status codes:
  - `200 OK` - Success
  - `201 Created` - Resource created
  - `400 Bad Request` - Invalid input
  - `401 Unauthorized` - No authentication
  - `403 Forbidden` - No permission
  - `404 Not Found` - Resource not found
  - `500 Internal Server Error` - Server error

**Example:**

```csharp
if (string.IsNullOrWhiteSpace(request.CompanyName))
    return BadRequest(new { message = "Company name is required" });

if (!await _context.Periods.AnyAsync(p => p.Id == job.PeriodId))
    return BadRequest(new { message = "Invalid group ID" });
```

#### 3. Database Operations

**Key Points:**

- Use async/await for all database operations (`Task`, `async Task`)
- Always `SaveChangesAsync()` after modifications
- Use LINQ for queries
- Handle `DbUpdateConcurrencyException` if needed

**Common Patterns:**

```csharp
// Create
var newJob = new JobApplication
{
    CompanyName = request.CompanyName,
    PeriodId = request.PeriodId
};
_context.JobApplications.Add(newJob);
await _context.SaveChangesAsync();

// Read
var job = await _context.JobApplications.FindAsync(id);
var allJobs = await _context.JobApplications.ToListAsync();

// Update
job.Status = request.Status;
_context.JobApplications.Update(job);
await _context.SaveChangesAsync();

// Delete
_context.JobApplications.Remove(job);
await _context.SaveChangesAsync();
```

#### 4. Authentication & Authorization

**JWT Token Flow:**

1. User registers → password hashed with BCrypt
2. User logs in → credentials validated
3. JWT token generated with user ID + expiration (24 hours)
4. Token sent to frontend, stored in localStorage
5. Frontend includes token in Authorization header for protected endpoints
6. Backend validates token with secret key

**Protecting Endpoints:**

```csharp
[HttpPost]
[Authorize]  // Only authenticated users
public async Task<ActionResult> CreateJob([FromBody] CreateJobRequest request)
{
    // Implementation
}
```

#### 5. Testing Your Backend

**Manual Testing (Swagger)**

1. Start: `dotnet run`
2. Open: https://localhost:5000/swagger
3. Test endpoints with different inputs
4. Check response status & data

**Testing Authentication:**

1. Call `POST /api/auth/register` with email/password
2. Call `POST /api/auth/login` with credentials
3. Copy token from response
4. Click "Authorize" in Swagger UI
5. Paste token: `Bearer {token}`
6. Test protected endpoints

**Unit Testing Setup (if needed):**

```bash
dotnet add package xunit
dotnet add package Moq
# Create Tests/ folder with [Entity]ControllerTests.cs
```

---

## Frontend Development Workflow

### Environment Setup

**Prerequisites**

- Node.js 16+ installed
- npm or yarn package manager
- VS Code recommended

**Initial Setup**

```bash
# Navigate to frontend folder
cd 260001_fe

# Install dependencies
npm install

# Start development server
npm run dev
# App runs on: http://localhost:3001

# Build for production (when ready)
npm run build
```

### Development Guidelines

#### 1. Creating a New Component

**Component Structure:**

```jsx
// src/components/ComponentName.jsx

import { useState, useEffect } from "react";

function ComponentName({ prop1, onAction }) {
  const [state, setState] = useState("");

  useEffect(() => {
    // Initialize on mount
  }, []);

  const handleAction = () => {
    // Handle user action
  };

  return <div className="styling-classes">{/* JSX content */}</div>;
}

export default ComponentName;
```

**Best Practices:**

- Use functional components with hooks
- Props for data passing down, callbacks for actions up
- One component per file
- Descriptive names matching component purpose
- CSS classes from index.css or Tailwind

#### 2. Styling with Tailwind CSS

**Available Classes:**

```css
/* Colors (Grayscale + Blue accent) */
bg-gray-900   /* Main background */
bg-gray-700   /* Cards */
bg-gray-600   /* Input fields */
bg-blue-500   /* Primary buttons */
text-white    /* Main text */
text-gray-300 /* Secondary text */
text-gray-400 /* Tertiary text */

/* Buttons */
.btn-primary    /* Blue button */
.btn-secondary  /* Gray button */

/* Spacing */
mt-8, mb-4, p-4 /* Margin/padding */

/* Layout */
flex, flex-col, gap-4 /* Flexbox */
grid, grid-cols-3     /* Grid */
w-full, max-w-4xl     /* Width */

/* Responsive */
sm:, md:, lg:, xl: /* Breakpoints */
```

**Custom Classes (index.css):**

```css
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition;
}

.card {
  @apply bg-gray-700 border border-gray-600 rounded p-4;
}

.input-field {
  @apply w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2;
}
```

#### 3. API Integration

**Location:** `src/api/`

**Creating API Service:**

```javascript
// src/api/itemAPI.js

import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const itemAPI = {
  getAll: async () => {
    const response = await api.get("/items");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/items", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/items/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/items/${id}`);
  },
};
```

**Using in Components:**

```jsx
import { useEffect, useState } from "react";
import { itemAPI } from "../api/itemAPI";

function ItemList() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await itemAPI.getAll();
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async (newItem) => {
    try {
      await itemAPI.create(newItem);
      fetchItems(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}

export default ItemList;
```

#### 4. State Management

**For Simple Cases (like Job Tracker):**

- Use `useState` for component state
- Pass data through props
- Use callbacks for parent-child communication

**For Complex Cases:**

- Consider Context API or Redux
- Create context providers for shared state

**Example (Job Tracker Pattern):**

```jsx
function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchGroups();
    fetchJobs();
  }, []);

  const fetchGroups = async () => {
    const data = await groupAPI.getAll();
    setGroups(data);
  };

  const fetchJobs = async () => {
    const data = await jobAPI.getAll();
    setJobs(data);
  };

  const handleCreateJob = async (jobData) => {
    await jobAPI.create(jobData);
    fetchJobs(); // Refresh
  };

  return (
    <>
      <JobForm onSubmit={handleCreateJob} groups={groups} />
      <GroupCard groups={groups} jobs={jobs} />
    </>
  );
}
```

#### 5. Testing Your Frontend

**Manual Testing:**

1. Start dev server: `npm run dev`
2. Open browser: http://localhost:3001
3. Test user flows:
   - Register new account
   - Login
   - Create job application
   - Edit job
   - Delete job
   - Create group
   - Delete group

**Browser DevTools:**

- Open DevTools (F12)
- Check Console for errors
- Check Network tab for API calls
- Inspect Elements for styling issues

**Common Issues:**

- CORS errors → Check backend CORS settings
- 401 Unauthorized → Token not sent or expired
- 404 Not Found → Endpoint URL incorrect
- Blank page → Check console for JavaScript errors

---

## Component-by-Component Development

### Backend Components

#### 1. User Model & Authentication

**Files:**

- `Models/User.cs` - Data model
- `Controllers/AuthController.cs` - Registration & login endpoints
- `DTOs/AuthRequest.cs`, `AuthResponse.cs` - Request/response objects

**Development Process:**

1. Define User model with Email, Username, PasswordHash
2. Create migrations: `dotnet ef migrations add AddUsers`
3. Implement Register endpoint:
   - Validate email/username unique
   - Hash password with BCrypt
   - Create user record
4. Implement Login endpoint:
   - Find user by email/username
   - Verify password
   - Generate JWT token
5. Test with Swagger

#### 2. Group Management (Periods)

**Files:**

- `Models/Period.cs` - Group model
- `Controllers/PeriodsController.cs` - CRUD endpoints

**Development Process:**

1. Define Period model with Name, DateStart, DateEnd
2. Create migration: `dotnet ef migrations add AddPeriods`
3. In `Program.cs`, add auto-creation of "Default" group
4. Implement endpoints:
   - GET all groups (with job count)
   - POST create group
   - PUT update group (rename)
   - DELETE group
5. Auto-calculate DateStart/DateEnd from associated jobs

#### 3. Job Application Tracking

**Files:**

- `Models/JobApplication.cs` - Job model with PeriodId FK
- `Controllers/JobsController.cs` - CRUD endpoints

**Development Process:**

1. Add PeriodId foreign key to JobApplication
2. Create migration: `dotnet ef migrations add AddJobPeriod`
3. Implement endpoints:
   - GET all jobs with group info
   - POST create job (assign to group)
   - PUT update job (change group, status, notes)
   - DELETE job
4. Add [Authorize] attribute to all endpoints
5. Test all CRUD operations

### Frontend Components

#### 1. Auth Components (Login, Register)

**Files:**

- `components/Login.jsx` - Login form
- `components/Register.jsx` - Registration form
- `api/authAPI.js` - Auth API service

**Development Process:**

1. Create Login form with email/password fields
2. Call authAPI.login() on submit
3. Store token in localStorage
4. Redirect to dashboard on success
5. Create Register form with email/username/password/confirm
6. Call authAPI.register() on submit
7. Auto-login after registration
8. Add error messages for failed attempts

#### 2. Job Management Components

**Files:**

- `components/JobForm.jsx` - New job form
- `components/JobCard.jsx` - Individual job display
- `components/JobList.jsx` - List of jobs
- `api/jobAPI.js` - Jobs API service

**Development Process:**

**JobForm:**

1. Create form with fields: Company, Title, URL, Date, Status, Group, Notes
2. Use group selector dropdown
3. Submit creates job via jobAPI.create()
4. Clear form on success
5. Show validation errors

**JobCard:**

1. Display job information in a card
2. Show edit/delete icons (✏️/🗑️)
3. Edit mode: allow inline editing of job details
4. Include group selector dropdown in edit mode
5. Handle save/cancel actions
6. Delete confirmation before removing

**JobList:**

1. Fetch all jobs on mount
2. Group jobs by group/period
3. Render GroupCard for each group
4. Pass jobs to GroupCard for display

#### 3. Group Management Components

**Files:**

- `components/GroupCard.jsx` - Individual group display
- `components/SimpleGroupControl.jsx` - Create group dropdown
- `api/groupAPI.js` - Groups API service

**Development Process:**

**GroupCard:**

1. Show group name and job count
2. Collapsible list of jobs
3. Double-click to rename group
4. Delete button (trash icon)
5. Allow deleting any group including Default
6. Show tooltip on hover: "Double-click to rename"

**SimpleGroupControl:**

1. Dropdown that appears on "+ New Group" button click
2. Input field for group name
3. Create/Cancel buttons
4. Auto-focus input field
5. Auto-close if input loses focus while empty

#### 4. Header & Footer

**Header:**

- Display logged-in user email/username
- Logout button (grayscale)

**Footer:**

- Contact information (email, phone, LinkedIn, GitHub)
- Copyright notice
- Centered layout with narrow spacing
- Grayscale icons with hover effects

---

## Testing Strategy

### Backend Testing

**Phase 1: Unit Testing**

- Test individual methods
- Mock database with in-memory SQLite
- Test password hashing
- Test JWT generation

**Phase 2: Integration Testing**

- Test API endpoints end-to-end
- Test database operations
- Test authentication flow

**Phase 3: Manual Testing**

- Use Swagger UI to test all endpoints
- Test with invalid inputs
- Test unauthorized access
- Test edge cases

### Frontend Testing

**Phase 1: Component Testing**

- Test components render correctly
- Test props passing
- Test user interactions
- Test API calls

**Phase 2: Integration Testing**

- Test complete user workflows
- Register → Login → Create Job → Edit → Delete
- Group creation, deletion, renaming
- Group selection and filtering

**Phase 3: Manual Testing**

- Browser testing on Chrome, Firefox, Safari
- Mobile responsive design
- Form validation
- Error message display
- Loading states

### E2E Testing (Optional)

**Tools:** Cypress or Playwright

**Test Scenarios:**

1. User registration with valid/invalid inputs
2. User login with correct/incorrect credentials
3. Create job and verify in list
4. Edit job and verify changes
5. Delete job and verify removal
6. Create group and set as default for new jobs
7. Delete group and verify jobs reassign

---

## Deployment

### Backend Deployment

**Production Checklist:**

- [ ] Change JWT secret in appsettings.json
- [ ] Update database connection string (if not local SQLite)
- [ ] Set logging level to Warning
- [ ] Enable HTTPS
- [ ] Configure CORS for frontend domain only
- [ ] Test all endpoints
- [ ] Set up database backups

**Deploy to Azure/IIS:**

```bash
# Publish
dotnet publish -c Release

# Deploy to server
# Copy release folder to server
# Configure IIS to point to application
```

### Frontend Deployment

**Production Build:**

```bash
npm run build
# Creates dist/ folder with optimized files
```

**Deploy to Vercel/Netlify:**

```bash
# Vercel
npm i -g vercel
vercel

# Netlify
npm run build
# Drag & drop dist folder to Netlify
```

**Environment Variables:**

- Create `.env.production`
- Set `VITE_API_BASE_URL` to backend production URL

---

## Common Issues & Solutions

### Backend Issues

**Issue 1: "EF Core migrations not applied"**

```
Solution:
dotnet ef database update
dotnet ef migrations add [Name]
```

**Issue 2: "CORS errors from frontend"**

```csharp
Solution: In Program.cs, verify CORS policy:
options.AddPolicy("AllowFrontend", policy =>
{
    policy.AllowAnyOrigin()
          .AllowAnyMethod()
          .AllowAnyHeader();
});
```

**Issue 3: "JWT token not validating"**

```
Solution:
- Check secret key length (must be 32+ chars)
- Verify token format: "Bearer {token}"
- Check token expiration (default 24 hours)
```

**Issue 4: "Password hashing failures"**

```
Solution: Use BCrypt.Net-Next library
using BCrypt.Net;
var hash = BCrypt.HashPassword(password, 12);
```

### Frontend Issues

**Issue 1: "Blank page after login"**

```
Solution: Check:
- Token stored in localStorage
- Routes configured correctly
- API URL in .env matches backend
```

**Issue 2: "401 Unauthorized errors"**

```
Solution:
- Verify token sent in Authorization header
- Check token not expired (24 hours)
- Verify backend validates token correctly
```

**Issue 3: "Styles not applying"**

```
Solution:
- Rebuild Tailwind: npm run dev
- Check class names spelling
- Verify index.css imported in main.jsx
```

**Issue 4: "API calls failing with CORS"**

```
Solution:
- Check backend CORS configuration
- Verify API base URL matches backend
- Check browser console for specific error
```

---

## Development Workflow Summary

### Daily Development Process

**Backend:**

1. Plan feature (model, endpoints, tests)
2. Create model (if needed)
3. Add migration: `dotnet ef migrations add [Name]`
4. Update migration: `dotnet ef database update`
5. Implement controller endpoints
6. Test with Swagger
7. Verify database changes

**Frontend:**

1. Plan component structure
2. Create API service (if needed)
3. Implement component
4. Add styling with Tailwind
5. Test in browser
6. Verify API integration
7. Test user workflows

### Version Control

```bash
# Before committing
git status
git add .
git commit -m "Feature: [Component] - [Description]"
git push

# Example messages:
# "Feature: Auth - Add JWT authentication"
# "Fix: JobCard - Fix date formatting"
# "Refactor: Dashboard - Extract GroupCard component"
# "Style: Footer - Center align contact info"
```

### Code Quality

**Backend:**

- Follow C# naming conventions (PascalCase for public members)
- Use meaningful variable names
- Add comments for complex logic
- Keep methods focused (single responsibility)

**Frontend:**

- Use camelCase for variables/functions
- Keep components small and reusable
- Add PropTypes or TypeScript (optional)
- Format code with Prettier

---

## Quick Reference

### Common Commands

**Backend:**

```bash
dotnet restore        # Install packages
dotnet build          # Compile
dotnet run            # Start server
dotnet clean          # Clean build files
dotnet ef migrations add [Name]  # Create migration
dotnet ef database update        # Apply migration
```

**Frontend:**

```bash
npm install           # Install dependencies
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
```

### Project Folders

**Backend:**

```
260001_be/
  ├─ Controllers/    (API endpoints)
  ├─ Models/         (Data models)
  ├─ Data/           (DbContext)
  ├─ DTOs/           (Request/response objects)
  ├─ Migrations/     (Database migrations)
  └─ Program.cs      (Configuration)
```

**Frontend:**

```
260001_fe/
  ├─ src/
  │  ├─ components/  (React components)
  │  ├─ api/         (API services)
  │  ├─ styles/      (CSS files)
  │  ├─ App.jsx      (Main component)
  │  └─ main.jsx     (Entry point)
  ├─ public/         (Static assets)
  └─ package.json    (Dependencies)
```

---

## Next Steps for Future Development

### Feature Ideas

1. **Job Statistics Dashboard**: Charts showing application progress
2. **Email Notifications**: Get alerts for important dates
3. **Interview Scheduling**: Track interview dates and times
4. **Resume Uploading**: Store resumes with applications
5. **Export Data**: Download applications as CSV/PDF
6. **Dark/Light Theme Toggle**: User preference saving
7. **Mobile App**: React Native version
8. **Advanced Filtering**: Filter by status, company, date range
9. **Search Functionality**: Find jobs by keyword
10. **Sharing**: Share job lists with others

### Performance Improvements

- Add pagination for large job lists
- Implement caching for groups
- Optimize database queries
- Add request debouncing for form inputs

### Security Enhancements

- Add rate limiting
- Implement refresh tokens
- Add two-factor authentication
- Sanitize user inputs
- Add HTTPS/SSL enforcement

---

## Support & Resources

**Documentation:**

- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)

**Tools:**

- Visual Studio 2022 - Backend IDE
- VS Code - Frontend editor
- Swagger UI - API testing
- Chrome DevTools - Frontend debugging

---

**Last Updated:** January 9, 2026  
**Version:** 1.1  
**Author:** Development Team
