namespace JobTracker.Api.Models
{
    public class Period
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Every user has exactly one default period. It receives jobs without a period
        /// and jobs from deleted periods, and it cannot be renamed or deleted.
        /// </summary>
        public bool IsDefault { get; set; }

        public DateTime? DateStart { get; set; }

        public DateTime? DateEnd { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Owner
        public int UserId { get; set; }

        public User User { get; set; } = null!;

        // Navigation property
        public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
    }
}
