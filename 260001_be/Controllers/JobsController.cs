using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using JobTracker.Api.Data;
using JobTracker.Api.Models;
using JobTracker.Api.DTOs;
using JobTracker.Api.Extensions;
using JobTracker.Api.Mappers;
using JobTracker.Api.Services;

namespace JobTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class JobsController : ControllerBase
    {
        private readonly JobTrackerDbContext _context;
        private readonly IPeriodService _periods;

        public JobsController(JobTrackerDbContext context, IPeriodService periods)
        {
            _context = context;
            _periods = periods;
        }

        // GET: api/jobs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetJobs()
        {
            var userId = User.GetUserId();

            var jobs = await _context.JobApplications
                .AsNoTracking()
                .Where(j => j.UserId == userId)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();

            return Ok(JobApplicationMapper.ToDtos(jobs));
        }

        // GET: api/jobs/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<JobApplicationDto>> GetJob(int id)
        {
            var userId = User.GetUserId();

            var job = await _context.JobApplications
                .AsNoTracking()
                .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

            // Another user's job looks exactly like a missing one
            if (job == null)
            {
                return NotFound("Job application not found");
            }

            return Ok(JobApplicationMapper.ToDto(job));
        }

        // POST: api/jobs
        [HttpPost]
        public async Task<ActionResult<JobApplicationDto>> CreateJob(CreateJobApplicationDto createDto)
        {
            var userId = User.GetUserId();

            int periodId;
            if (createDto.PeriodId is null or 0)
            {
                periodId = (await _periods.GetDefaultAsync(userId)).Id;
            }
            else if (await _periods.OwnsAsync(userId, createDto.PeriodId.Value))
            {
                periodId = createDto.PeriodId.Value;
            }
            else
            {
                return Problem(detail: "Period not found", statusCode: StatusCodes.Status400BadRequest);
            }

            var job = JobApplication.Create(
                userId,
                periodId,
                createDto.CompanyName,
                createDto.JobTitle,
                createDto.JobUrl,
                createDto.DateApplied,
                createDto.Status,
                createDto.Notes
            );

            _context.JobApplications.Add(job);
            await _context.SaveChangesAsync();

            await _periods.RefreshDatesAsync(userId, periodId);

            return CreatedAtAction(nameof(GetJob), new { id = job.Id }, JobApplicationMapper.ToDto(job));
        }

        // PUT: api/jobs/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<JobApplicationDto>> UpdateJob(int id, UpdateJobApplicationDto updateDto)
        {
            var userId = User.GetUserId();

            var job = await _context.JobApplications
                .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

            if (job == null)
            {
                return NotFound("Job application not found");
            }

            var oldPeriodId = job.PeriodId;

            if (updateDto.PeriodId is > 0 && updateDto.PeriodId != job.PeriodId)
            {
                if (!await _periods.OwnsAsync(userId, updateDto.PeriodId.Value))
                {
                    return Problem(detail: "Period not found", statusCode: StatusCodes.Status400BadRequest);
                }

                job.ChangePeriod(updateDto.PeriodId.Value);
            }

            if (updateDto.CompanyName != null)
                job.UpdateCompanyName(updateDto.CompanyName);

            if (updateDto.JobTitle != null)
                job.UpdateJobTitle(updateDto.JobTitle);

            // null = leave unchanged, empty string = clear
            if (updateDto.JobUrl != null)
                job.UpdateJobUrl(updateDto.JobUrl);

            if (updateDto.Status.HasValue)
                job.UpdateStatus(updateDto.Status.Value);

            if (updateDto.DateApplied.HasValue)
                job.UpdateDateApplied(updateDto.DateApplied.Value);

            if (updateDto.Notes != null)
                job.UpdateNotes(updateDto.Notes);

            await _context.SaveChangesAsync();

            // Application dates may have changed, and the job may have left its old period
            await _periods.RefreshDatesAsync(userId, job.PeriodId);
            if (oldPeriodId != job.PeriodId)
            {
                await _periods.RefreshDatesAsync(userId, oldPeriodId);
            }

            return Ok(JobApplicationMapper.ToDto(job));
        }

        // DELETE: api/jobs/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteJob(int id)
        {
            var userId = User.GetUserId();

            var job = await _context.JobApplications
                .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

            if (job == null)
            {
                return NotFound("Job application not found");
            }

            var periodId = job.PeriodId;

            _context.JobApplications.Remove(job);
            await _context.SaveChangesAsync();

            await _periods.RefreshDatesAsync(userId, periodId);

            return NoContent();
        }
    }
}
