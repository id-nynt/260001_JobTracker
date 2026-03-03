namespace JobTracker.Api.Mappers
{
    using JobTracker.Api.Models;
    using JobTracker.Api.DTOs;

    public static class JobApplicationMapper
    {
        /// <summary>
        /// Maps a CreateJobApplicationDto to a JobApplication entity using the factory method.
        /// </summary>
        public static JobApplication CreateFromDto(CreateJobApplicationDto dto, int periodId)
        {
            return JobApplication.Create(
                dto.CompanyName,
                dto.JobTitle,
                dto.JobUrl,
                periodId,
                dto.DateApplied,
                dto.Notes
            );
        }

        /// <summary>
        /// Maps a JobApplication entity to a JobApplicationDto for API responses.
        /// </summary>
        public static JobApplicationDto ToDto(JobApplication entity)
        {
            return new JobApplicationDto
            {
                Id = entity.Id,
                CompanyName = entity.CompanyName,
                JobTitle = entity.JobTitle,
                JobUrl = entity.JobUrl,
                Status = entity.Status,
                DateApplied = entity.DateApplied,
                Notes = entity.Notes,
                PeriodId = entity.PeriodId,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }

        /// <summary>
        /// Maps a collection of JobApplication entities to JobApplicationDto DTOs.
        /// </summary>
        public static IEnumerable<JobApplicationDto> ToDtos(IEnumerable<JobApplication> entities)
        {
            return entities.Select(ToDto);
        }
    }
}
