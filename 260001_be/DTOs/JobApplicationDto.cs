using System.ComponentModel.DataAnnotations;
using JobTracker.Api.Models;

namespace JobTracker.Api.DTOs
{
    public class CreateJobApplicationDto
    {
        [Required, StringLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        [Required, StringLength(200)]
        public string JobTitle { get; set; } = string.Empty;

        [StringLength(2048)]
        public string? JobUrl { get; set; }

        public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;

        public DateTime DateApplied { get; set; }

        [StringLength(4000)]
        public string? Notes { get; set; }

        public int? PeriodId { get; set; }
    }

    public class UpdateJobApplicationDto
    {
        [StringLength(200)]
        public string? CompanyName { get; set; }

        [StringLength(200)]
        public string? JobTitle { get; set; }

        // An empty string clears the URL
        [StringLength(2048)]
        public string? JobUrl { get; set; }

        public ApplicationStatus? Status { get; set; }

        public DateTime? DateApplied { get; set; }

        // An empty string clears the notes
        [StringLength(4000)]
        public string? Notes { get; set; }

        public int? PeriodId { get; set; }
    }

    public class JobApplicationDto
    {
        public int Id { get; set; }

        public string CompanyName { get; set; } = string.Empty;

        public string JobTitle { get; set; } = string.Empty;

        public string? JobUrl { get; set; }

        public ApplicationStatus Status { get; set; }

        public DateTime DateApplied { get; set; }

        public string? Notes { get; set; }

        public int PeriodId { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
