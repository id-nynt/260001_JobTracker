using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace JobTracker.Api.Tests.Api
{
    public class PeriodsEndpointsTests : IClassFixture<ApiFactory>
    {
        private readonly ApiFactory _factory;

        public PeriodsEndpointsTests(ApiFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task A_period_reports_its_job_count_and_date_range_as_jobs_are_added_moved_and_deleted()
        {
            var user = await TestUser.RegisterAsync(_factory);
            var search = await user.CreatePeriodAsync("2026 search");
            var january = await user.CreateJobAsync(dateApplied: "2026-01-10", periodId: search.Id);
            var february = await user.CreateJobAsync(dateApplied: "2026-02-01", periodId: search.Id);

            var afterAdding = await user.GetPeriodAsync(search.Id);
            afterAdding.Count.Should().Be(2);
            afterAdding.DateStart.Should().Be(new DateTime(2026, 1, 10));
            afterAdding.DateEnd.Should().Be(new DateTime(2026, 2, 1));

            // Moving the February job out shrinks the old period and fills the new one
            var defaultPeriod = await user.GetDefaultPeriodAsync();
            await user.Client.PutAsJsonAsync($"/api/jobs/{february.Id}", new { periodId = defaultPeriod.Id });

            var afterMoving = await user.GetPeriodAsync(search.Id);
            afterMoving.Count.Should().Be(1);
            afterMoving.DateStart.Should().Be(new DateTime(2026, 1, 10));
            afterMoving.DateEnd.Should().Be(new DateTime(2026, 1, 10));
            var defaultAfterMoving = await user.GetPeriodAsync(defaultPeriod.Id);
            defaultAfterMoving.Count.Should().Be(1);
            defaultAfterMoving.DateStart.Should().Be(new DateTime(2026, 2, 1));

            // Deleting the last job clears the dates instead of leaving stale ones
            await user.Client.DeleteAsync($"/api/jobs/{january.Id}");

            var afterDeleting = await user.GetPeriodAsync(search.Id);
            afterDeleting.Count.Should().Be(0);
            afterDeleting.DateStart.Should().BeNull();
            afterDeleting.DateEnd.Should().BeNull();
        }

        [Fact]
        public async Task Deleting_a_period_moves_its_jobs_to_the_default_period_instead_of_deleting_them()
        {
            var user = await TestUser.RegisterAsync(_factory);
            var search = await user.CreatePeriodAsync("Old search");
            var job = await user.CreateJobAsync(periodId: search.Id);

            var delete = await user.Client.DeleteAsync($"/api/periods/{search.Id}");

            delete.StatusCode.Should().Be(HttpStatusCode.NoContent);
            var defaultPeriod = await user.GetDefaultPeriodAsync();
            (await user.GetJobAsync(job.Id)).PeriodId.Should().Be(defaultPeriod.Id);
            defaultPeriod.Count.Should().Be(1);
            (await user.GetPeriodsAsync()).Should().NotContain(p => p.Id == search.Id);
        }

        [Fact]
        public async Task The_default_period_cannot_be_deleted_or_renamed()
        {
            var user = await TestUser.RegisterAsync(_factory);
            var defaultPeriod = await user.GetDefaultPeriodAsync();

            var delete = await user.Client.DeleteAsync($"/api/periods/{defaultPeriod.Id}");
            var rename = await user.Client.PutAsJsonAsync($"/api/periods/{defaultPeriod.Id}", new { name = "Renamed" });

            delete.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            rename.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            (await user.GetDefaultPeriodAsync()).Name.Should().Be("Default");
        }

        [Fact]
        public async Task Period_names_are_unique_per_user_not_across_all_users()
        {
            var alice = await TestUser.RegisterAsync(_factory);
            var bob = await TestUser.RegisterAsync(_factory);

            await alice.CreatePeriodAsync("2026");
            await bob.CreatePeriodAsync("2026");

            var duplicate = await alice.Client.PostAsJsonAsync("/api/periods", new { name = "2026" });
            duplicate.StatusCode.Should().Be(HttpStatusCode.Conflict);
        }
    }
}
