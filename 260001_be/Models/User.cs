namespace JobTracker.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        public string Email { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Period> Periods { get; set; } = new List<Period>();

        public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
    }
}
