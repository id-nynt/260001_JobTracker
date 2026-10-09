using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using JobTracker.Api.Data;

namespace JobTracker.Api.Tests.Api
{
    /// <summary>
    /// Boots the real API in memory. Only the database is swapped: PostgreSQL becomes an
    /// in-memory SQLite database, so the controllers, auth, validation and middleware are all real.
    /// </summary>
    public class ApiFactory : WebApplicationFactory<Program>
    {
        public const string JwtSecret = "test-only-secret-that-is-long-enough-for-hs256";

        // An in-memory SQLite database lives only as long as its connection stays open
        private readonly SqliteConnection _connection = new("DataSource=:memory:");

        // Registration and login are rate limited; tests create many users, so the limit is lifted by default
        protected virtual int AuthPermitLimit => 10_000;

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Jwt:Secret"] = JwtSecret,
                    ["RateLimiting:AuthPermitLimit"] = AuthPermitLimit.ToString()
                });
            });

            builder.ConfigureServices(services =>
            {
                services.Remove(services.Single(d => d.ServiceType == typeof(DbContextOptions<JobTrackerDbContext>)));

                _connection.Open();
                services.AddDbContext<JobTrackerDbContext>(options => options.UseSqlite(_connection));
            });
        }

        protected override IHost CreateHost(IHostBuilder builder)
        {
            var host = base.CreateHost(builder);

            using var scope = host.Services.CreateScope();
            scope.ServiceProvider.GetRequiredService<JobTrackerDbContext>().Database.EnsureCreated();

            return host;
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);

            if (disposing)
                _connection.Dispose();
        }
    }

    /// <summary>Same API, but only 3 attempts per minute on the auth endpoints.</summary>
    public class RateLimitedApiFactory : ApiFactory
    {
        public const int Limit = 3;

        protected override int AuthPermitLimit => Limit;
    }
}
