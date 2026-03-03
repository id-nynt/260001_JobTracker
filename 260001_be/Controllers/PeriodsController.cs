using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using JobTracker.Api.Data;
using JobTracker.Api.DTOs;
using JobTracker.Api.Models;
using JobTracker.Api.Mappers;

namespace JobTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PeriodsController : ControllerBase
    {
        private readonly JobTrackerDbContext _context;
        private readonly ILogger<PeriodsController> _logger;

        public PeriodsController(JobTrackerDbContext context, ILogger<PeriodsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/periods
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PeriodDto>>> GetPeriods()
        {
            try
            {
                var periods = await _context.Periods
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                return Ok(PeriodMapper.ToDtos(periods));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving periods");
                return StatusCode(500, "An error occurred while retrieving periods");
            }
        }

        // GET: api/periods/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PeriodDto>> GetPeriod(int id)
        {
            try
            {
                var period = await _context.Periods
                    .Include(p => p.JobApplications)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (period == null)
                {
                    return NotFound("Period not found");
                }

                return Ok(PeriodMapper.ToDto(period));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving period");
                return StatusCode(500, "An error occurred while retrieving period");
            }
        }

        // POST: api/periods
        [HttpPost]
        public async Task<ActionResult<PeriodDto>> CreatePeriod([FromBody] CreatePeriodRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return BadRequest("Period name is required");
                }

                var period = new Period
                {
                    Name = request.Name,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Periods.Add(period);
                await _context.SaveChangesAsync();

                var dto = new PeriodDto
                {
                    Id = period.Id,
                    Name = period.Name,
                    DateStart = period.DateStart,
                    DateEnd = period.DateEnd,
                    Count = 0,
                    CreatedAt = period.CreatedAt,
                    UpdatedAt = period.UpdatedAt
                };

                return CreatedAtAction(nameof(GetPeriod), new { id = period.Id }, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating period");
                return StatusCode(500, "An error occurred while creating period");
            }
        }

        // PUT: api/periods/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<PeriodDto>> UpdatePeriod(int id, [FromBody] UpdatePeriodRequest request)
        {
            try
            {
                var period = await _context.Periods.FindAsync(id);

                if (period == null)
                {
                    return NotFound("Period not found");
                }

                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return BadRequest("Period name is required");
                }

                period.Name = request.Name;
                period.UpdatedAt = DateTime.UtcNow;

                _context.Periods.Update(period);
                await _context.SaveChangesAsync();

                var jobs = await _context.JobApplications
                    .Where(j => j.PeriodId == id)
                    .ToListAsync();

                var dto = new PeriodDto
                {
                    Id = period.Id,
                    Name = period.Name,
                    DateStart = period.DateStart,
                    DateEnd = period.DateEnd,
                    Count = jobs.Count,
                    CreatedAt = period.CreatedAt,
                    UpdatedAt = period.UpdatedAt
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating period");
                return StatusCode(500, "An error occurred while updating period");
            }
        }

        // DELETE: api/periods/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePeriod(int id)
        {
            try
            {
                var period = await _context.Periods.FindAsync(id);

                if (period == null)
                {
                    return NotFound("Period not found");
                }

                // Check if this is the default period
                if (period.Name == "Default")
                {
                    return BadRequest("Cannot delete the default period");
                }

                // Move all jobs from this period to default period
                var defaultPeriod = await _context.Periods
                    .FirstOrDefaultAsync(p => p.Name == "Default");

                if (defaultPeriod != null)
                {
                    var jobsToMove = await _context.JobApplications
                        .Where(j => j.PeriodId == id)
                        .ToListAsync();

                    foreach (var job in jobsToMove)
                    {
                        job.PeriodId = defaultPeriod.Id;
                    }

                    _context.JobApplications.UpdateRange(jobsToMove);
                }

                _context.Periods.Remove(period);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting period");
                return StatusCode(500, "An error occurred while deleting period");
            }
        }
    }
}
