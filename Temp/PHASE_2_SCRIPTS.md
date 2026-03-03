# Phase 2: Create First Entity & Smoke Test - Implementation Scripts

This document contains all the code scripts needed to complete Phase 2 of the development process.

## Table of Contents
1. [Entity Models](#entity-models)
2. [Mock Data](#mock-data)
3. [Basic Controller](#basic-controller)

---

## Entity Models

### 1. Period.cs
**Location:** `260001_be/Models/Period.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace JobTracker.Api.Models
{
    public class Period
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Navigation property
        public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
    }
}
```

---

### 2. JobApplication.cs
**Location:** `260001_be/Models/JobApplication.cs`

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobTracker.Api.Models
{
    public class JobApplication
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [Required]
        [StringLength(200)]
        public string Company { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        public DateTime ApplicationDate { get; set; }

        [StringLength(50)]
        public string Status { get; set; } // e.g., "Applied", "Interviewing", "Offered", "Rejected"

        [StringLength(200)]
        public string JobUrl { get; set; }

        public int? Salary { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Foreign Keys
        public int UserId { get; set; }

        public int PeriodId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public User User { get; set; }

        [ForeignKey("PeriodId")]
        public Period Period { get; set; }
    }
}
```

---

### 3. User.cs
**Location:** `260001_be/Models/User.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace JobTracker.Api.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Username { get; set; }

        [Required]
        [StringLength(255)]
        public string Email { get; set; }

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; }

        [StringLength(100)]
        public string FirstName { get; set; }

        [StringLength(100)]
        public string LastName { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Navigation property
        public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
    }
}
```

---

## Mock Data

### MockData.cs
**Location:** `260001_be/Data/MockData.cs`

```csharp
using JobTracker.Api.Models;

namespace JobTracker.Api.Data
{
    public static class MockData
    {
        // Mock Users
        public static List<User> Users = new List<User>
        {
            new User
            {
                Id = 1,
                Username = "john_doe",
                Email = "john@example.com",
                PasswordHash = "hashed_password_123",
                FirstName = "John",
                LastName = "Doe",
                CreatedAt = DateTime.UtcNow.AddMonths(-6),
                UpdatedAt = DateTime.UtcNow.AddMonths(-1)
            },
            new User
            {
                Id = 2,
                Username = "jane_smith",
                Email = "jane@example.com",
                PasswordHash = "hashed_password_456",
                FirstName = "Jane",
                LastName = "Smith",
                CreatedAt = DateTime.UtcNow.AddMonths(-4),
                UpdatedAt = DateTime.UtcNow.AddMonths(-2)
            }
        };

        // Mock Periods
        public static List<Period> Periods = new List<Period>
        {
            new Period
            {
                Id = 1,
                Name = "Q1 2026 Job Search",
                Description = "Job applications for Q1 2026",
                StartDate = new DateTime(2026, 1, 1),
                EndDate = new DateTime(2026, 3, 31),
                CreatedAt = DateTime.UtcNow.AddMonths(-1),
                UpdatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new Period
            {
                Id = 2,
                Name = "Q2 2026 Job Search",
                Description = "Job applications for Q2 2026",
                StartDate = new DateTime(2026, 4, 1),
                EndDate = new DateTime(2026, 6, 30),
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                UpdatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new Period
            {
                Id = 3,
                Name = "Mid-Year Transition",
                Description = "Looking for career transitions",
                StartDate = new DateTime(2026, 7, 1),
                EndDate = new DateTime(2026, 9, 30),
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        // Mock Job Applications
        public static List<JobApplication> JobApplications = new List<JobApplication>
        {
            new JobApplication
            {
                Id = 1,
                Title = "Senior Software Engineer",
                Company = "Tech Corp Inc",
                Description = "Full-stack development opportunity",
                ApplicationDate = new DateTime(2026, 1, 5),
                Status = "Applied",
                JobUrl = "https://careers.techcorp.com/senior-engineer",
                Salary = 150000,
                UserId = 1,
                PeriodId = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                UpdatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new JobApplication
            {
                Id = 2,
                Title = "Frontend Developer",
                Company = "Web Solutions Ltd",
                Description = "React and TypeScript based role",
                ApplicationDate = new DateTime(2026, 1, 8),
                Status = "Interviewing",
                JobUrl = "https://websolutions.com/careers/frontend",
                Salary = 120000,
                UserId = 1,
                PeriodId = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-18),
                UpdatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new JobApplication
            {
                Id = 3,
                Title = "Backend Engineer",
                Company = "Cloud Services Co",
                Description = "C# and .NET Core development",
                ApplicationDate = new DateTime(2026, 1, 10),
                Status = "Offered",
                JobUrl = "https://cloudservices.io/jobs/backend",
                Salary = 130000,
                UserId = 1,
                PeriodId = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-16),
                UpdatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new JobApplication
            {
                Id = 4,
                Title = "Full Stack Developer",
                Company = "StartUp Innovations",
                Description = "Early stage startup opportunity",
                ApplicationDate = new DateTime(2026, 1, 12),
                Status = "Rejected",
                JobUrl = "https://startupinnovations.com/careers",
                Salary = 110000,
                UserId = 1,
                PeriodId = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-14),
                UpdatedAt = DateTime.UtcNow.AddDays(-7)
            },
            new JobApplication
            {
                Id = 5,
                Title = "DevOps Engineer",
                Company = "Infrastructure Experts",
                Description = "AWS and Kubernetes experience required",
                ApplicationDate = new DateTime(2026, 1, 15),
                Status = "Applied",
                JobUrl = "https://infraexperts.com/devops",
                Salary = 140000,
                UserId = 2,
                PeriodId = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-12),
                UpdatedAt = DateTime.UtcNow.AddDays(-8)
            }
        };
    }
}
```

---

## Basic Controller

### JobsController.cs
**Location:** `260001_be/Controllers/JobsController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using JobTracker.Api.Models;
using JobTracker.Api.Data;

namespace JobTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobsController : ControllerBase
    {
        private readonly ILogger<JobsController> _logger;

        public JobsController(ILogger<JobsController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Get all job applications (with mock data)
        /// </summary>
        /// <returns>List of all job applications</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public ActionResult<IEnumerable<JobApplication>> GetAll()
        {
            try
            {
                _logger.LogInformation("GetAll: Retrieving all job applications");
                return Ok(MockData.JobApplications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAll: An error occurred while retrieving job applications");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while retrieving job applications" });
            }
        }

        /// <summary>
        /// Get a specific job application by ID
        /// </summary>
        /// <param name="id">The ID of the job application</param>
        /// <returns>The requested job application</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<JobApplication> GetById(int id)
        {
            try
            {
                _logger.LogInformation($"GetById: Retrieving job application with ID {id}");
                
                var jobApplication = MockData.JobApplications.FirstOrDefault(j => j.Id == id);
                
                if (jobApplication == null)
                {
                    _logger.LogWarning($"GetById: Job application with ID {id} not found");
                    return NotFound(new { message = $"Job application with ID {id} not found" });
                }

                return Ok(jobApplication);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"GetById: An error occurred while retrieving job application with ID {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while retrieving the job application" });
            }
        }

        /// <summary>
        /// Create a new job application
        /// </summary>
        /// <param name="jobApplication">The job application data</param>
        /// <returns>The created job application</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public ActionResult<JobApplication> Create([FromBody] JobApplication jobApplication)
        {
            try
            {
                if (jobApplication == null)
                {
                    _logger.LogWarning("Create: Received null job application");
                    return BadRequest(new { message = "Job application data is required" });
                }

                if (string.IsNullOrWhiteSpace(jobApplication.Title))
                {
                    _logger.LogWarning("Create: Job title is missing");
                    return BadRequest(new { message = "Job title is required" });
                }

                if (string.IsNullOrWhiteSpace(jobApplication.Company))
                {
                    _logger.LogWarning("Create: Company name is missing");
                    return BadRequest(new { message = "Company name is required" });
                }

                // Generate new ID (in mock mode)
                jobApplication.Id = MockData.JobApplications.Max(j => j.Id) + 1;
                jobApplication.CreatedAt = DateTime.UtcNow;
                jobApplication.UpdatedAt = DateTime.UtcNow;

                MockData.JobApplications.Add(jobApplication);

                _logger.LogInformation($"Create: Job application created with ID {jobApplication.Id}");
                return CreatedAtAction(nameof(GetById), new { id = jobApplication.Id }, jobApplication);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create: An error occurred while creating job application");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while creating the job application" });
            }
        }

        /// <summary>
        /// Update an existing job application
        /// </summary>
        /// <param name="id">The ID of the job application to update</param>
        /// <param name="jobApplication">The updated job application data</param>
        /// <returns>The updated job application</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<JobApplication> Update(int id, [FromBody] JobApplication jobApplication)
        {
            try
            {
                if (jobApplication == null)
                {
                    _logger.LogWarning("Update: Received null job application");
                    return BadRequest(new { message = "Job application data is required" });
                }

                var existingJob = MockData.JobApplications.FirstOrDefault(j => j.Id == id);
                if (existingJob == null)
                {
                    _logger.LogWarning($"Update: Job application with ID {id} not found");
                    return NotFound(new { message = $"Job application with ID {id} not found" });
                }

                // Update fields
                existingJob.Title = jobApplication.Title ?? existingJob.Title;
                existingJob.Company = jobApplication.Company ?? existingJob.Company;
                existingJob.Description = jobApplication.Description ?? existingJob.Description;
                existingJob.Status = jobApplication.Status ?? existingJob.Status;
                existingJob.JobUrl = jobApplication.JobUrl ?? existingJob.JobUrl;
                if (jobApplication.Salary.HasValue)
                {
                    existingJob.Salary = jobApplication.Salary;
                }
                existingJob.UpdatedAt = DateTime.UtcNow;

                _logger.LogInformation($"Update: Job application with ID {id} updated");
                return Ok(existingJob);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Update: An error occurred while updating job application with ID {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while updating the job application" });
            }
        }

        /// <summary>
        /// Delete a job application
        /// </summary>
        /// <param name="id">The ID of the job application to delete</param>
        /// <returns>No content on success</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult Delete(int id)
        {
            try
            {
                var jobApplication = MockData.JobApplications.FirstOrDefault(j => j.Id == id);
                if (jobApplication == null)
                {
                    _logger.LogWarning($"Delete: Job application with ID {id} not found");
                    return NotFound(new { message = $"Job application with ID {id} not found" });
                }

                MockData.JobApplications.Remove(jobApplication);

                _logger.LogInformation($"Delete: Job application with ID {id} deleted");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Delete: An error occurred while deleting job application with ID {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while deleting the job application" });
            }
        }
    }
}
```

---

### PeriodsController.cs
**Location:** `260001_be/Controllers/PeriodsController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using JobTracker.Api.Models;
using JobTracker.Api.Data;

namespace JobTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PeriodsController : ControllerBase
    {
        private readonly ILogger<PeriodsController> _logger;

        public PeriodsController(ILogger<PeriodsController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Get all periods (with mock data)
        /// </summary>
        /// <returns>List of all periods</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public ActionResult<IEnumerable<Period>> GetAll()
        {
            try
            {
                _logger.LogInformation("GetAll: Retrieving all periods");
                return Ok(MockData.Periods);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAll: An error occurred while retrieving periods");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while retrieving periods" });
            }
        }

        /// <summary>
        /// Get a specific period by ID
        /// </summary>
        /// <param name="id">The ID of the period</param>
        /// <returns>The requested period</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<Period> GetById(int id)
        {
            try
            {
                _logger.LogInformation($"GetById: Retrieving period with ID {id}");
                
                var period = MockData.Periods.FirstOrDefault(p => p.Id == id);
                
                if (period == null)
                {
                    _logger.LogWarning($"GetById: Period with ID {id} not found");
                    return NotFound(new { message = $"Period with ID {id} not found" });
                }

                return Ok(period);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"GetById: An error occurred while retrieving period with ID {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while retrieving the period" });
            }
        }

        /// <summary>
        /// Create a new period
        /// </summary>
        /// <param name="period">The period data</param>
        /// <returns>The created period</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public ActionResult<Period> Create([FromBody] Period period)
        {
            try
            {
                if (period == null)
                {
                    _logger.LogWarning("Create: Received null period");
                    return BadRequest(new { message = "Period data is required" });
                }

                if (string.IsNullOrWhiteSpace(period.Name))
                {
                    _logger.LogWarning("Create: Period name is missing");
                    return BadRequest(new { message = "Period name is required" });
                }

                if (period.EndDate <= period.StartDate)
                {
                    _logger.LogWarning("Create: End date must be after start date");
                    return BadRequest(new { message = "End date must be after start date" });
                }

                // Generate new ID (in mock mode)
                period.Id = MockData.Periods.Max(p => p.Id) + 1;
                period.CreatedAt = DateTime.UtcNow;
                period.UpdatedAt = DateTime.UtcNow;

                MockData.Periods.Add(period);

                _logger.LogInformation($"Create: Period created with ID {period.Id}");
                return CreatedAtAction(nameof(GetById), new { id = period.Id }, period);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create: An error occurred while creating period");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while creating the period" });
            }
        }

        /// <summary>
        /// Update an existing period
        /// </summary>
        /// <param name="id">The ID of the period to update</param>
        /// <param name="period">The updated period data</param>
        /// <returns>The updated period</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<Period> Update(int id, [FromBody] Period period)
        {
            try
            {
                if (period == null)
                {
                    _logger.LogWarning("Update: Received null period");
                    return BadRequest(new { message = "Period data is required" });
                }

                var existingPeriod = MockData.Periods.FirstOrDefault(p => p.Id == id);
                if (existingPeriod == null)
                {
                    _logger.LogWarning($"Update: Period with ID {id} not found");
                    return NotFound(new { message = $"Period with ID {id} not found" });
                }

                // Update fields
                existingPeriod.Name = period.Name ?? existingPeriod.Name;
                existingPeriod.Description = period.Description ?? existingPeriod.Description;
                if (period.StartDate != default)
                {
                    existingPeriod.StartDate = period.StartDate;
                }
                if (period.EndDate != default)
                {
                    existingPeriod.EndDate = period.EndDate;
                }
                existingPeriod.UpdatedAt = DateTime.UtcNow;

                _logger.LogInformation($"Update: Period with ID {id} updated");
                return Ok(existingPeriod);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Update: An error occurred while updating period with ID {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while updating the period" });
            }
        }

        /// <summary>
        /// Delete a period
        /// </summary>
        /// <param name="id">The ID of the period to delete</param>
        /// <returns>No content on success</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult Delete(int id)
        {
            try
            {
                var period = MockData.Periods.FirstOrDefault(p => p.Id == id);
                if (period == null)
                {
                    _logger.LogWarning($"Delete: Period with ID {id} not found");
                    return NotFound(new { message = $"Period with ID {id} not found" });
                }

                MockData.Periods.Remove(period);

                _logger.LogInformation($"Delete: Period with ID {id} deleted");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Delete: An error occurred while deleting period with ID {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "An error occurred while deleting the period" });
            }
        }
    }
}
```

---

## Summary of Phase 2 Implementation

### Files to Create:
1. **Models:**
   - `260001_be/Models/Period.cs`
   - `260001_be/Models/JobApplication.cs`
   - `260001_be/Models/User.cs` (if not already created)

2. **Data:**
   - `260001_be/Data/MockData.cs`

3. **Controllers:**
   - `260001_be/Controllers/JobsController.cs`
   - `260001_be/Controllers/PeriodsController.cs`

### Key Features:
- ✅ Full CRUD operations for both JobApplications and Periods
- ✅ Proper HTTP status codes (200, 201, 204, 400, 404, 500)
- ✅ Comprehensive logging at all levels
- ✅ Error handling with meaningful messages
- ✅ XML documentation comments for API documentation
- ✅ 5+ realistic mock records for testing
- ✅ Proper entity relationships (JobApplication → Period, User)
- ✅ Validation for required fields

### Smoke Testing (Phase 2):
Test these endpoints manually using Postman or REST Client:

```http
### Get all jobs
GET http://localhost:5000/api/jobs

### Get job by ID
GET http://localhost:5000/api/jobs/1

### Create new job
POST http://localhost:5000/api/jobs
Content-Type: application/json

{
  "title": "Test Job",
  "company": "Test Company",
  "description": "A test position",
  "applicationDate": "2026-01-10T00:00:00Z",
  "status": "Applied",
  "userId": 1,
  "periodId": 1
}

### Update job
PUT http://localhost:5000/api/jobs/1
Content-Type: application/json

{
  "title": "Updated Job Title",
  "company": "Test Company",
  "description": "Updated description",
  "applicationDate": "2026-01-10T00:00:00Z",
  "status": "Interviewing",
  "userId": 1,
  "periodId": 1
}

### Delete job
DELETE http://localhost:5000/api/jobs/1

### Get all periods
GET http://localhost:5000/api/periods

### Get period by ID
GET http://localhost:5000/api/periods/1

### Create new period
POST http://localhost:5000/api/periods
Content-Type: application/json

{
  "name": "Test Period",
  "description": "A test period",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-03-31T00:00:00Z"
}

### Update period
PUT http://localhost:5000/api/periods/1
Content-Type: application/json

{
  "name": "Updated Period Name",
  "description": "Updated description",
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-03-31T00:00:00Z"
}

### Delete period
DELETE http://localhost:5000/api/periods/1
```

### Checkpoint:
After implementing all scripts:
- [ ] All models compile without errors
- [ ] Mock data initializes correctly
- [ ] All controller endpoints are callable
- [ ] GET endpoints return 200 OK with correct data structure
- [ ] POST endpoints return 201 Created
- [ ] PUT endpoints return 200 OK with updated data
- [ ] DELETE endpoints return 204 NoContent
- [ ] Invalid requests return 400 BadRequest
- [ ] Non-existent resources return 404 NotFound
- [ ] JSON response structure matches entity structure

