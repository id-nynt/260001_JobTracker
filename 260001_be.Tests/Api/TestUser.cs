using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using JobTracker.Api.DTOs;

namespace JobTracker.Api.Tests.Api
{
    /// <summary>
    /// A registered user together with an HTTP client that is already signed in as them.
    /// The helpers assert the expected success status, so a failure points at the broken setup step.
    /// </summary>
    public sealed class TestUser
    {
        public const string Password = "correct-horse-battery";

        public HttpClient Client { get; }

        public int Id { get; }

        public string Username { get; }

        public string Email { get; }

        private TestUser(HttpClient client, int id, string username, string email)
        {
            Client = client;
            Id = id;
            Username = username;
            Email = email;
        }

        public static async Task<TestUser> RegisterAsync(ApiFactory factory)
        {
            var username = "user" + Guid.NewGuid().ToString("N")[..12];
            var email = $"{username}@example.com";

            var client = factory.CreateClient();
            var response = await client.PostAsJsonAsync("/api/auth/register", new
            {
                email,
                username,
                password = Password,
                confirmPassword = Password
            });

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var auth = (await response.Content.ReadFromJsonAsync<AuthResponse>())!;

            client.DefaultRequestHeaders.Authorization = new("Bearer", auth.Token);
            return new TestUser(client, auth.User!.Id, username, email);
        }

        public async Task<JobApplicationDto> CreateJobAsync(
            string company = "Acme",
            string title = "Developer",
            string dateApplied = "2026-01-10",
            int? periodId = null,
            string? status = null,
            string? jobUrl = null,
            string? notes = null)
        {
            var body = new Dictionary<string, object?>
            {
                ["companyName"] = company,
                ["jobTitle"] = title,
                ["dateApplied"] = dateApplied
            };
            if (periodId != null) body["periodId"] = periodId;
            if (status != null) body["status"] = status;
            if (jobUrl != null) body["jobUrl"] = jobUrl;
            if (notes != null) body["notes"] = notes;

            var response = await Client.PostAsJsonAsync("/api/jobs", body);
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            return (await response.Content.ReadFromJsonAsync<JobApplicationDto>())!;
        }

        public async Task<JobApplicationDto> GetJobAsync(int id)
        {
            var response = await Client.GetAsync($"/api/jobs/{id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            return (await response.Content.ReadFromJsonAsync<JobApplicationDto>())!;
        }

        public async Task<List<JobApplicationDto>> GetJobsAsync()
        {
            return (await Client.GetFromJsonAsync<List<JobApplicationDto>>("/api/jobs"))!;
        }

        public async Task<PeriodDto> CreatePeriodAsync(string name)
        {
            var response = await Client.PostAsJsonAsync("/api/periods", new { name });
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            return (await response.Content.ReadFromJsonAsync<PeriodDto>())!;
        }

        public async Task<List<PeriodDto>> GetPeriodsAsync()
        {
            return (await Client.GetFromJsonAsync<List<PeriodDto>>("/api/periods"))!;
        }

        public async Task<PeriodDto> GetPeriodAsync(int id)
        {
            return (await GetPeriodsAsync()).Single(p => p.Id == id);
        }

        public async Task<PeriodDto> GetDefaultPeriodAsync()
        {
            return (await GetPeriodsAsync()).Single(p => p.IsDefault);
        }
    }
}
