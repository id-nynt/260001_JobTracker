using FluentAssertions;
using JobTracker.Api.Models;

namespace JobTracker.Api.Tests.Domain
{
    public class JobApplicationTests
    {
        [Fact]
        public void Create_cleans_up_text_and_stores_the_date_as_utc()
        {
            // A date from a <input type="date"> arrives with no time zone information
            var dateWithoutKind = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Unspecified);

            var job = JobApplication.Create(1, 2, "  Acme  ", " Developer ", "   ", dateWithoutKind, ApplicationStatus.Interviewing, "");

            job.CompanyName.Should().Be("Acme");
            job.JobTitle.Should().Be("Developer");
            job.JobUrl.Should().BeNull();
            job.Notes.Should().BeNull();
            job.Status.Should().Be(ApplicationStatus.Interviewing);
            job.DateApplied.Kind.Should().Be(DateTimeKind.Utc);
            job.DateApplied.Should().Be(new DateTime(2026, 1, 10));
        }

        [Theory]
        [InlineData("", "Developer", 2, -1)]
        [InlineData("   ", "Developer", 2, -1)]
        [InlineData("Acme", "", 2, -1)]
        [InlineData("Acme", "Developer", 0, -1)]
        [InlineData("Acme", "Developer", 2, 2)]
        public void Create_rejects_invalid_values(string company, string title, int periodId, int daysFromToday)
        {
            var date = DateTime.UtcNow.Date.AddDays(daysFromToday);

            var create = () => JobApplication.Create(1, periodId, company, title, null, date);

            create.Should().Throw<DomainException>();
        }

        [Fact]
        public void A_rejected_update_leaves_the_job_untouched()
        {
            var job = JobApplication.Create(1, 2, "Acme", "Developer", null, DateTime.UtcNow.Date.AddDays(-1));
            var updatedAt = job.UpdatedAt;

            var updates = new Action[]
            {
                () => job.UpdateCompanyName(" "),
                () => job.UpdateJobTitle(""),
                () => job.UpdateDateApplied(DateTime.UtcNow.Date.AddDays(10)),
                () => job.ChangePeriod(0)
            };

            foreach (var update in updates)
                update.Should().Throw<DomainException>();

            job.CompanyName.Should().Be("Acme");
            job.JobTitle.Should().Be("Developer");
            job.PeriodId.Should().Be(2);
            job.UpdatedAt.Should().Be(updatedAt);
        }
    }
}
