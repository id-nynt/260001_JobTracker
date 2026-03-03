namespace JobTracker.Api.DTOs
{
    public class PeriodDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public DateTime? DateStart { get; set; }

        public DateTime? DateEnd { get; set; }

        public int Count { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }

    public class CreatePeriodRequest
    {
        public string Name { get; set; } = string.Empty;
    }

    public class UpdatePeriodRequest
    {
        public string Name { get; set; } = string.Empty;
    }
}
