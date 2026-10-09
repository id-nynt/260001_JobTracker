using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using JobTracker.Api.Models;

namespace JobTracker.Api.Tests.Api
{
    public class JobsEndpointsTests : IClassFixture<ApiFactory>
    {
        private readonly ApiFactory _factory;

        public JobsEndpointsTests(ApiFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task A_new_job_without_a_period_goes_into_the_default_period_with_status_applied()
        {
            var user = await TestUser.RegisterAsync(_factory);

            var job = await user.CreateJobAsync();

            job.Status.Should().Be(ApplicationStatus.Applied);
            job.PeriodId.Should().Be((await user.GetDefaultPeriodAsync()).Id);
        }

        [Theory]
        [InlineData("status", "Bogus", "status")]
        [InlineData("dateApplied", "2999-01-01", "future")]
        [InlineData("companyName", "   ", "CompanyName")]
        public async Task Invalid_jobs_are_rejected_with_a_message_that_names_the_problem(string field, string value, string expectedInMessage)
        {
            var user = await TestUser.RegisterAsync(_factory);
            var body = new Dictionary<string, object>
            {
                ["companyName"] = "Acme",
                ["jobTitle"] = "Developer",
                ["dateApplied"] = "2026-01-10",
                [field] = value
            };

            var response = await user.Client.PostAsJsonAsync("/api/jobs", body);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var problem = (await response.Content.ReadFromJsonAsync<ProblemDetails>())!;
            problem.Detail.Should().Contain(expectedInMessage);
            (await user.GetJobsAsync()).Should().BeEmpty();
        }

        [Fact]
        public async Task Updating_changes_only_the_sent_fields_and_an_empty_string_clears_optional_ones()
        {
            var user = await TestUser.RegisterAsync(_factory);
            var job = await user.CreateJobAsync(company: "Acme", jobUrl: "https://acme.example/jobs/1", notes: "Phone screen booked");

            var statusOnly = await user.Client.PutAsJsonAsync($"/api/jobs/{job.Id}", new { status = "Offered" });
            statusOnly.StatusCode.Should().Be(HttpStatusCode.OK);
            var afterStatus = await user.GetJobAsync(job.Id);
            afterStatus.Status.Should().Be(ApplicationStatus.Offered);
            afterStatus.CompanyName.Should().Be("Acme");
            afterStatus.JobUrl.Should().Be("https://acme.example/jobs/1");
            afterStatus.Notes.Should().Be("Phone screen booked");

            await user.Client.PutAsJsonAsync($"/api/jobs/{job.Id}", new { jobUrl = "", notes = "" });
            var afterClear = await user.GetJobAsync(job.Id);
            afterClear.JobUrl.Should().BeNull();
            afterClear.Notes.Should().BeNull();
            afterClear.Status.Should().Be(ApplicationStatus.Offered);
        }

        [Fact]
        public async Task An_invalid_update_is_rejected_and_leaves_the_job_unchanged()
        {
            var user = await TestUser.RegisterAsync(_factory);
            var job = await user.CreateJobAsync(company: "Acme");

            var response = await user.Client.PutAsJsonAsync($"/api/jobs/{job.Id}", new { companyName = "", status = "Rejected" });

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var unchanged = await user.GetJobAsync(job.Id);
            unchanged.CompanyName.Should().Be("Acme");
            unchanged.Status.Should().Be(ApplicationStatus.Applied);
        }
    }
}
