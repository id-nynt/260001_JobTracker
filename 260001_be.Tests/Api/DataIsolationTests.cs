using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using JobTracker.Api.Models;

namespace JobTracker.Api.Tests.Api
{
    /// <summary>
    /// A signed-in user must never be able to see or change another user's data.
    /// Every test also re-reads the owner's data afterwards, so "404" can't hide a change that went through.
    /// </summary>
    public class DataIsolationTests : IClassFixture<ApiFactory>
    {
        private readonly ApiFactory _factory;

        public DataIsolationTests(ApiFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Another_user_cannot_list_read_change_or_delete_a_job()
        {
            var alice = await TestUser.RegisterAsync(_factory);
            var bob = await TestUser.RegisterAsync(_factory);
            var job = await alice.CreateJobAsync(company: "Acme", status: "Interviewing");

            (await bob.GetJobsAsync()).Should().BeEmpty();
            (await bob.Client.GetAsync($"/api/jobs/{job.Id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);

            var update = await bob.Client.PutAsJsonAsync($"/api/jobs/{job.Id}", new { status = "Rejected", companyName = "Hacked" });
            update.StatusCode.Should().Be(HttpStatusCode.NotFound);

            var delete = await bob.Client.DeleteAsync($"/api/jobs/{job.Id}");
            delete.StatusCode.Should().Be(HttpStatusCode.NotFound);

            var unchanged = await alice.GetJobAsync(job.Id);
            unchanged.CompanyName.Should().Be("Acme");
            unchanged.Status.Should().Be(ApplicationStatus.Interviewing);
        }

        [Fact]
        public async Task Another_user_cannot_put_a_job_into_a_period_they_do_not_own()
        {
            var alice = await TestUser.RegisterAsync(_factory);
            var bob = await TestUser.RegisterAsync(_factory);
            var alicesPeriod = await alice.CreatePeriodAsync("Alice search");

            var create = await bob.Client.PostAsJsonAsync("/api/jobs", new
            {
                companyName = "Acme",
                jobTitle = "Developer",
                dateApplied = "2026-01-10",
                periodId = alicesPeriod.Id
            });
            create.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            var bobsJob = await bob.CreateJobAsync();
            var move = await bob.Client.PutAsJsonAsync($"/api/jobs/{bobsJob.Id}", new { periodId = alicesPeriod.Id });
            move.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            (await bob.GetJobAsync(bobsJob.Id)).PeriodId.Should().NotBe(alicesPeriod.Id);
            (await alice.GetPeriodAsync(alicesPeriod.Id)).Count.Should().Be(0);
        }

        [Fact]
        public async Task Another_user_cannot_see_rename_or_delete_a_period()
        {
            var alice = await TestUser.RegisterAsync(_factory);
            var bob = await TestUser.RegisterAsync(_factory);
            var period = await alice.CreatePeriodAsync("Alice search");
            await alice.CreateJobAsync(periodId: period.Id);

            (await bob.GetPeriodsAsync()).Should().ContainSingle().Which.IsDefault.Should().BeTrue();
            (await bob.Client.GetAsync($"/api/periods/{period.Id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);

            var rename = await bob.Client.PutAsJsonAsync($"/api/periods/{period.Id}", new { name = "Hacked" });
            rename.StatusCode.Should().Be(HttpStatusCode.NotFound);

            var delete = await bob.Client.DeleteAsync($"/api/periods/{period.Id}");
            delete.StatusCode.Should().Be(HttpStatusCode.NotFound);

            var unchanged = await alice.GetPeriodAsync(period.Id);
            unchanged.Name.Should().Be("Alice search");
            unchanged.Count.Should().Be(1);
        }
    }
}
