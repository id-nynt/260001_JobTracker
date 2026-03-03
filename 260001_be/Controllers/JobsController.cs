using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using JobTracker.Api.Data;
using JobTracker.Api.Models;
using JobTracker.Api.DTOs;
using JobTracker.Api.Mappers;

namespace JobTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class JobsController : ControllerBase
    {
        private readonly JobTrackerDbContext _context;
        private readonly ILogger<JobsController> _logger;

        public JobsController(JobTrackerDbContext context, ILogger<JobsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/jobs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetJobs()
        {
            try
            {
                var jobs = await _context.JobApplications
                    .OrderByDescending(j => j.CreatedAt)
                    .ToListAsync();

                return Ok(JobApplicationMapper.ToDtos(jobs));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving jobs");
                return StatusCode(500, "An error occurred while retrieving jobs");
            }
        }

        // GET: api/jobs/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<JobApplicationDto>> GetJob(int id)
        {
            try
            {
                var job = await _context.JobApplications.FindAsync(id);

                if (job == null)
                {
                    return NotFound("Job application not found");
                }

                return Ok(JobApplicationMapper.ToDto(job));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving job {JobId}", id);
                return StatusCode(500, "An error occurred while retrieving the job");
            }
        }

        // POST: api/jobs
        [HttpPost]
        public async Task<ActionResult<JobApplicationDto>> CreateJob(CreateJobApplicationDto createDto)
        {
            try
            {
                // Get or create default period
                var periodId = createDto.PeriodId;

                if (periodId == null || periodId == 0)
                {
                    var defaultPeriod = await _context.Periods
                        .FirstOrDefaultAsync(p => p.Name == "Default");

                    if (defaultPeriod == null)
                    {
                        defaultPeriod = new Period { Name = "Default" };
                        _context.Periods.Add(defaultPeriod);
                        await _context.SaveChangesAsync();
                    }

                    periodId = defaultPeriod.Id;
                }

                var job = JobApplication.Create(
                    createDto.CompanyName,
                    createDto.JobTitle,
                    createDto.JobUrl,
                    periodId.Value,
                    createDto.DateApplied,
                    createDto.Status,
                    createDto.Notes
                );

                _context.JobApplications.Add(job);
                await _context.SaveChangesAsync();

                // Update period dates
                await UpdatePeriodDates(periodId.Value);

                return CreatedAtAction(nameof(GetJob), new { id = job.Id }, JobApplicationMapper.ToDto(job));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error creating job");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating job");
                return StatusCode(500, "An error occurred while creating the job");
            }
        }

        // PUT: api/jobs/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<JobApplicationDto>> UpdateJob(int id, UpdateJobApplicationDto updateDto)
        {
            try
            {
                var job = await _context.JobApplications.FindAsync(id);

                if (job == null)
                {
                    return NotFound("Job application not found");
                }

                if (!string.IsNullOrEmpty(updateDto.CompanyName))
                    job.UpdateCompanyName(updateDto.CompanyName);

                if (!string.IsNullOrEmpty(updateDto.JobTitle))
                    job.UpdateJobTitle(updateDto.JobTitle);

                if (!string.IsNullOrEmpty(updateDto.JobUrl))
                    job.UpdateJobUrl(updateDto.JobUrl);

                if (!string.IsNullOrEmpty(updateDto.Status))
                    job.UpdateStatus(updateDto.Status);

                if (updateDto.DateApplied.HasValue)
                    job.UpdateDateApplied(updateDto.DateApplied.Value);

                if (updateDto.Notes != null)
                    job.UpdateNotes(updateDto.Notes);

                // Handle period change
                var oldPeriodId = job.PeriodId;
                if (updateDto.PeriodId.HasValue && updateDto.PeriodId.Value != 0)
                {
                    job.ChangePeriod(updateDto.PeriodId.Value);
                }

                _context.JobApplications.Update(job);
                await _context.SaveChangesAsync();

                // Update dates for both old and new periods
                if (oldPeriodId != job.PeriodId)
                {
                    await UpdatePeriodDates(oldPeriodId);
                }
                await UpdatePeriodDates(job.PeriodId);

                return Ok(JobApplicationMapper.ToDto(job));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error updating job {JobId}", id);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating job {JobId}", id);
                return StatusCode(500, "An error occurred while updating the job");
            }
        }

        // DELETE: api/jobs/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteJob(int id)
        {
            try
            {
                var job = await _context.JobApplications.FindAsync(id);

                if (job == null)
                {
                    return NotFound("Job application not found");
                }

                _context.JobApplications.Remove(job);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting job {JobId}", id);
                return StatusCode(500, "An error occurred while deleting the job");
            }
        }

        // Helper method to update period dates based on jobs
        private async Task UpdatePeriodDates(int periodId)
        {
            var jobs = await _context.JobApplications
                .Where(j => j.PeriodId == periodId)
                .OrderBy(j => j.DateApplied)
                .ToListAsync();

            var period = await _context.Periods.FindAsync(periodId);
            if (period != null && jobs.Count > 0)
            {
                period.DateStart = jobs.First().DateApplied;
                period.DateEnd = jobs.Last().DateApplied;
                period.UpdatedAt = DateTime.UtcNow;
                _context.Periods.Update(period);
                await _context.SaveChangesAsync();
            }
        }
    }
}
