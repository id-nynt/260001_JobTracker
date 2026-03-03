namespace JobTracker.Api.Mappers
{
    using JobTracker.Api.Models;
    using JobTracker.Api.DTOs;

    public static class PeriodMapper
    {
        /// <summary>
        /// Maps a Period entity to a PeriodDto for API responses.
        /// </summary>
        public static PeriodDto ToDto(Period entity)
        {
            return new PeriodDto
            {
                Id = entity.Id,
                Name = entity.Name,
                DateStart = entity.DateStart,
                DateEnd = entity.DateEnd,
                Count = entity.JobApplications.Count,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }

        /// <summary>
        /// Maps a collection of Period entities to PeriodDto DTOs.
        /// </summary>
        public static IEnumerable<PeriodDto> ToDtos(IEnumerable<Period> entities)
        {
            return entities.Select(ToDto);
        }
    }
}
