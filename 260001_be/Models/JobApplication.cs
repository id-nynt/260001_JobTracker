namespace JobTracker.Api.Models
{
    public sealed class JobApplication
    {
        private static readonly string[] ValidStatuses = { "Applied", "Interviewing", "Offered", "Rejected", "Accepted" };

        public int Id { get; set; }

        public string CompanyName { get; set; } = string.Empty;

        public string JobTitle { get; set; } = string.Empty;

        public string? JobUrl { get; set; }

        public string Status { get; set; } = "Applied";

        public DateTime DateApplied { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        public int PeriodId { get; set; }

        // Navigation property
        public Period Period { get; set; } = null!;

        // EF Core requires parameterless constructor
        public JobApplication() { }

        private JobApplication(string companyName, string jobTitle, string? jobUrl, int periodId, DateTime dateApplied, string? notes = null, string? status = null)
        {
            ValidateCompanyName(companyName);
            ValidateJobTitle(jobTitle);
            ValidateDateApplied(dateApplied);
            if (!string.IsNullOrEmpty(status))
                ValidateStatus(status);

            CompanyName = companyName;
            JobTitle = jobTitle;
            JobUrl = jobUrl;
            Status = status ?? "Applied";
            DateApplied = dateApplied;
            Notes = notes;
            PeriodId = periodId;
        }

        /// <summary>
        /// Factory method to create a new job application with validation.
        /// </summary>
        public static JobApplication Create(string companyName, string jobTitle, string? jobUrl, int periodId, DateTime dateApplied, string? notes = null)
        {
            return new JobApplication(companyName, jobTitle, jobUrl, periodId, dateApplied, notes);
        }

        /// <summary>
        /// Factory method to create a new job application with validation, including status.
        /// </summary>
        public static JobApplication Create(string companyName, string jobTitle, string? jobUrl, int periodId, DateTime dateApplied, string status, string? notes = null)
        {
            return new JobApplication(companyName, jobTitle, jobUrl, periodId, dateApplied, notes, status);
        }

        public void UpdateCompanyName(string newCompanyName)
        {
            ValidateCompanyName(newCompanyName);
            CompanyName = newCompanyName;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateJobTitle(string newJobTitle)
        {
            ValidateJobTitle(newJobTitle);
            JobTitle = newJobTitle;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateJobUrl(string? newJobUrl)
        {
            JobUrl = newJobUrl;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateStatus(string newStatus)
        {
            ValidateStatus(newStatus);
            Status = newStatus;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateDateApplied(DateTime newDateApplied)
        {
            ValidateDateApplied(newDateApplied);
            DateApplied = newDateApplied;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateNotes(string? newNotes)
        {
            Notes = newNotes;
            UpdatedAt = DateTime.UtcNow;
        }

        public void ChangePeriod(int newPeriodId)
        {
            if (newPeriodId <= 0)
                throw new ArgumentException("Period ID must be positive.", nameof(newPeriodId));

            PeriodId = newPeriodId;
            UpdatedAt = DateTime.UtcNow;
        }

        // Validation methods
        private static void ValidateCompanyName(string companyName)
        {
            if (string.IsNullOrWhiteSpace(companyName))
                throw new ArgumentException("Company name cannot be empty or whitespace.", nameof(companyName));
        }

        private static void ValidateJobTitle(string jobTitle)
        {
            if (string.IsNullOrWhiteSpace(jobTitle))
                throw new ArgumentException("Job title cannot be empty or whitespace.", nameof(jobTitle));
        }

        private static void ValidateStatus(string status)
        {
            if (!ValidStatuses.Contains(status))
                throw new ArgumentException($"Status must be one of: {string.Join(", ", ValidStatuses)}", nameof(status));
        }

        private static void ValidateDateApplied(DateTime dateApplied)
        {
            // Allow dates up to end of today (in case of timezone differences)
            var today = DateTime.UtcNow.Date.AddDays(1);
            if (dateApplied > today)
                throw new ArgumentException("Date applied cannot be in the future.", nameof(dateApplied));
        }
    }
}
