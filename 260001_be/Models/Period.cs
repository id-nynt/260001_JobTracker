namespace JobTracker.Api.Models
{
    public class Period
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public DateTime? DateStart { get; set; }

        public DateTime? DateEnd { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
    }
}
