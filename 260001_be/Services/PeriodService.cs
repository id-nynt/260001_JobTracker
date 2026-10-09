using Microsoft.EntityFrameworkCore;
using JobTracker.Api.Data;
using JobTracker.Api.Models;

namespace JobTracker.Api.Services
{
    public interface IPeriodService
    {
        /// <summary>Returns the user's default period, creating it if it is missing.</summary>
        Task<Period> GetDefaultAsync(int userId);

        /// <summary>True when the period exists and belongs to the user.</summary>
        Task<bool> OwnsAsync(int userId, int periodId);

        /// <summary>Recalculates DateStart/DateEnd from the period's jobs (null when it has none).</summary>
        Task RefreshDatesAsync(int userId, int periodId);
    }

    public class PeriodService : IPeriodService
    {
        public const string DefaultName = "Default";

        private readonly JobTrackerDbContext _context;

        public PeriodService(JobTrackerDbContext context)
        {
            _context = context;
        }

        public async Task<Period> GetDefaultAsync(int userId)
        {
            var period = await _context.Periods
                .FirstOrDefaultAsync(p => p.UserId == userId && p.IsDefault);

            if (period == null)
            {
                period = new Period { UserId = userId, Name = DefaultName, IsDefault = true };
                _context.Periods.Add(period);
                await _context.SaveChangesAsync();
            }

            return period;
        }

        public Task<bool> OwnsAsync(int userId, int periodId)
        {
            return _context.Periods.AnyAsync(p => p.Id == periodId && p.UserId == userId);
        }

        public async Task RefreshDatesAsync(int userId, int periodId)
        {
            var period = await _context.Periods
                .FirstOrDefaultAsync(p => p.Id == periodId && p.UserId == userId);

            if (period == null)
                return;

            var range = await _context.JobApplications
                .Where(j => j.PeriodId == periodId && j.UserId == userId)
                .GroupBy(_ => 1)
                .Select(g => new { Start = g.Min(j => j.DateApplied), End = g.Max(j => j.DateApplied) })
                .FirstOrDefaultAsync();

            period.DateStart = range?.Start;
            period.DateEnd = range?.End;
            period.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}
