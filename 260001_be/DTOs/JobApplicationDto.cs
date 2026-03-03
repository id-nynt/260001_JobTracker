namespace JobTracker.Api.DTOs
{
    public class CreateJobApplicationDto
    {
        public string CompanyName { get; set; } = string.Empty;

        public string JobTitle { get; set; } = string.Empty;

        public string? JobUrl { get; set; }

        public string Status { get; set; } = "Applied";

        public DateTime DateApplied { get; set; }

        public string? Notes { get; set; }

        public int? PeriodId { get; set; }
    }

    public class UpdateJobApplicationDto
    {
        public string? CompanyName { get; set; }

        public string? JobTitle { get; set; }

        public string? JobUrl { get; set; }

        public string? Status { get; set; }

        public DateTime? DateApplied { get; set; }

        public string? Notes { get; set; }

        public int? PeriodId { get; set; }
    }

    public class JobApplicationDto
    {
        public int Id { get; set; }

        public string CompanyName { get; set; } = string.Empty;

        public string JobTitle { get; set; } = string.Empty;

        public string? JobUrl { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime DateApplied { get; set; }

        public string? Notes { get; set; }

        public int PeriodId { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
