namespace JobTracker.Api.Mappers
{
    using System.Linq.Expressions;
    using JobTracker.Api.Models;
    using JobTracker.Api.DTOs;

    public static class PeriodMapper
    {
        /// <summary>
        /// Query projection that computes the job count in the database,
        /// so the jobs themselves do not have to be loaded.
        /// </summary>
        public static readonly Expression<Func<Period, PeriodDto>> Projection = p => new PeriodDto
        {
            Id = p.Id,
            Name = p.Name,
            IsDefault = p.IsDefault,
            DateStart = p.DateStart,
            DateEnd = p.DateEnd,
            Count = p.JobApplications.Count,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };

        /// <summary>
        /// Maps a Period entity to a PeriodDto for API responses.
        /// </summary>
        public static PeriodDto ToDto(Period entity, int count)
        {
            return new PeriodDto
            {
                Id = entity.Id,
                Name = entity.Name,
                IsDefault = entity.IsDefault,
                DateStart = entity.DateStart,
                DateEnd = entity.DateEnd,
                Count = count,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }
    }
}
