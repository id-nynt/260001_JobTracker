using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using JobTracker.Api.Data;
using JobTracker.Api.DTOs;
using JobTracker.Api.Extensions;
using JobTracker.Api.Mappers;
using JobTracker.Api.Models;
using JobTracker.Api.Services;

namespace JobTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PeriodsController : ControllerBase
    {
        private readonly JobTrackerDbContext _context;
        private readonly IPeriodService _periods;

        public PeriodsController(JobTrackerDbContext context, IPeriodService periods)
        {
            _context = context;
            _periods = periods;
        }

        // GET: api/periods
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PeriodDto>>> GetPeriods()
        {
            var userId = User.GetUserId();

            var periods = await _context.Periods
                .AsNoTracking()
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(PeriodMapper.Projection)
                .ToListAsync();

            return Ok(periods);
        }

        // GET: api/periods/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PeriodDto>> GetPeriod(int id)
        {
            var userId = User.GetUserId();

            var period = await _context.Periods
                .AsNoTracking()
                .Where(p => p.Id == id && p.UserId == userId)
                .Select(PeriodMapper.Projection)
                .FirstOrDefaultAsync();

            if (period == null)
            {
                return NotFound("Period not found");
            }

            return Ok(period);
        }

        // POST: api/periods
        [HttpPost]
        public async Task<ActionResult<PeriodDto>> CreatePeriod([FromBody] CreatePeriodRequest request)
        {
            var userId = User.GetUserId();
            var name = request.Name.Trim();

            if (string.IsNullOrEmpty(name))
            {
                return Problem(detail: "Period name is required", statusCode: StatusCodes.Status400BadRequest);
            }

            if (await _context.Periods.AnyAsync(p => p.UserId == userId && p.Name == name))
            {
                return Problem(detail: "A period with this name already exists", statusCode: StatusCodes.Status409Conflict);
            }

            var period = new Period { UserId = userId, Name = name };

            _context.Periods.Add(period);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPeriod), new { id = period.Id }, PeriodMapper.ToDto(period, 0));
        }

        // PUT: api/periods/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<PeriodDto>> UpdatePeriod(int id, [FromBody] UpdatePeriodRequest request)
        {
            var userId = User.GetUserId();
            var name = request.Name.Trim();

            var period = await _context.Periods
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (period == null)
            {
                return NotFound("Period not found");
            }

            if (string.IsNullOrEmpty(name))
            {
                return Problem(detail: "Period name is required", statusCode: StatusCodes.Status400BadRequest);
            }

            if (period.IsDefault && name != period.Name)
            {
                return Problem(detail: "The default period cannot be renamed", statusCode: StatusCodes.Status400BadRequest);
            }

            if (await _context.Periods.AnyAsync(p => p.UserId == userId && p.Name == name && p.Id != id))
            {
                return Problem(detail: "A period with this name already exists", statusCode: StatusCodes.Status409Conflict);
            }

            period.Name = name;
            period.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var count = await _context.JobApplications.CountAsync(j => j.PeriodId == id && j.UserId == userId);

            return Ok(PeriodMapper.ToDto(period, count));
        }

        // DELETE: api/periods/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePeriod(int id)
        {
            var userId = User.GetUserId();

            var period = await _context.Periods
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (period == null)
            {
                return NotFound("Period not found");
            }

            if (period.IsDefault)
            {
                return Problem(detail: "Cannot delete the default period", statusCode: StatusCodes.Status400BadRequest);
            }

            // Move all jobs from this period to the user's default period
            var defaultPeriod = await _periods.GetDefaultAsync(userId);

            var jobsToMove = await _context.JobApplications
                .Where(j => j.PeriodId == id && j.UserId == userId)
                .ToListAsync();

            foreach (var job in jobsToMove)
            {
                job.ChangePeriod(defaultPeriod.Id);
            }

            _context.Periods.Remove(period);
            await _context.SaveChangesAsync();

            await _periods.RefreshDatesAsync(userId, defaultPeriod.Id);

            return NoContent();
        }
    }
}
