namespace JobTracker.Api.Models
{
    public sealed class JobApplication
    {
        public int Id { get; set; }

        public string CompanyName { get; set; } = string.Empty;

        public string JobTitle { get; set; } = string.Empty;

        public string? JobUrl { get; set; }

        public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;

        public DateTime DateApplied { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Owner
        public int UserId { get; set; }

        public User User { get; set; } = null!;

        // Foreign key
        public int PeriodId { get; set; }

        // Navigation property
        public Period Period { get; set; } = null!;

        // EF Core requires parameterless constructor
        public JobApplication() { }

        private JobApplication(int userId, int periodId, string companyName, string jobTitle, string? jobUrl, DateTime dateApplied, ApplicationStatus status, string? notes)
        {
            ValidateCompanyName(companyName);
            ValidateJobTitle(jobTitle);
            ValidateDateApplied(dateApplied);
            ValidatePeriodId(periodId);

            UserId = userId;
            PeriodId = periodId;
            CompanyName = companyName.Trim();
            JobTitle = jobTitle.Trim();
            JobUrl = NormalizeOptional(jobUrl);
            Status = status;
            DateApplied = ToUtc(dateApplied);
            Notes = NormalizeOptional(notes);
        }

        /// <summary>
        /// Factory method to create a new job application with validation.
        /// </summary>
        public static JobApplication Create(int userId, int periodId, string companyName, string jobTitle, string? jobUrl, DateTime dateApplied, ApplicationStatus status = ApplicationStatus.Applied, string? notes = null)
        {
            return new JobApplication(userId, periodId, companyName, jobTitle, jobUrl, dateApplied, status, notes);
        }

        public void UpdateCompanyName(string newCompanyName)
        {
            ValidateCompanyName(newCompanyName);
            CompanyName = newCompanyName.Trim();
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateJobTitle(string newJobTitle)
        {
            ValidateJobTitle(newJobTitle);
            JobTitle = newJobTitle.Trim();
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateJobUrl(string? newJobUrl)
        {
            JobUrl = NormalizeOptional(newJobUrl);
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateStatus(ApplicationStatus newStatus)
        {
            Status = newStatus;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateDateApplied(DateTime newDateApplied)
        {
            ValidateDateApplied(newDateApplied);
            DateApplied = ToUtc(newDateApplied);
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateNotes(string? newNotes)
        {
            Notes = NormalizeOptional(newNotes);
            UpdatedAt = DateTime.UtcNow;
        }

        public void ChangePeriod(int newPeriodId)
        {
            ValidatePeriodId(newPeriodId);

            PeriodId = newPeriodId;
            UpdatedAt = DateTime.UtcNow;
        }

        // Empty or whitespace-only optional text is stored as null
        private static string? NormalizeOptional(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        // Postgres (timestamptz) only accepts UTC values
        private static DateTime ToUtc(DateTime value)
        {
            return value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
            };
        }

        // Validation methods
        private static void ValidateCompanyName(string companyName)
        {
            if (string.IsNullOrWhiteSpace(companyName))
                throw new DomainException("Company name cannot be empty or whitespace.");
        }

        private static void ValidateJobTitle(string jobTitle)
        {
            if (string.IsNullOrWhiteSpace(jobTitle))
                throw new DomainException("Job title cannot be empty or whitespace.");
        }

        private static void ValidatePeriodId(int periodId)
        {
            if (periodId <= 0)
                throw new DomainException("Period ID must be positive.");
        }

        private static void ValidateDateApplied(DateTime dateApplied)
        {
            // Allow dates up to end of today (in case of timezone differences)
            var today = DateTime.UtcNow.Date.AddDays(1);
            if (ToUtc(dateApplied) > today)
                throw new DomainException("Date applied cannot be in the future.");
        }
    }
}
