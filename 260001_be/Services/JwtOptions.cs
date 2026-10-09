namespace JobTracker.Api.Services
{
    public class JwtOptions
    {
        public const string SectionName = "Jwt";

        // No default on purpose: the app refuses to start without a real secret
        public string Secret { get; set; } = string.Empty;

        public string Issuer { get; set; } = "JobTrackerAPI";

        public string Audience { get; set; } = "JobTrackerApp";

        public int ExpirationMinutes { get; set; } = 1440;
    }
}
