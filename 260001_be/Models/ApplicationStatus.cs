using System.Text.Json.Serialization;

namespace JobTracker.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ApplicationStatus
    {
        Applied,
        Interviewing,
        Offered,
        Accepted,
        Rejected
    }
}
