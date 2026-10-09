using FluentAssertions;
using Npgsql;
using JobTracker.Api.Infrastructure;

namespace JobTracker.Api.Tests.Domain
{
    public class PostgresConnectionStringTests
    {
        [Fact]
        public void A_database_url_becomes_a_connection_string_with_tls_and_decoded_credentials()
        {
            // Passwords in URLs are percent-encoded; "p%40ss%2Fword" is "p@ss/word"
            var result = PostgresConnectionString.Normalize("postgresql://app_user:p%40ss%2Fword@db.example.com/jobtracker?sslmode=require");

            var parsed = new NpgsqlConnectionStringBuilder(result);
            parsed.Host.Should().Be("db.example.com");
            parsed.Port.Should().Be(5432);
            parsed.Database.Should().Be("jobtracker");
            parsed.Username.Should().Be("app_user");
            parsed.Password.Should().Be("p@ss/word");
            parsed.SslMode.Should().Be(SslMode.Require);
        }

        [Theory]
        [InlineData("Host=localhost;Port=5432;Database=jobtracker;Username=u;Password=p")]
        [InlineData(null)]
        public void Other_values_are_left_alone(string? value)
        {
            PostgresConnectionString.Normalize(value).Should().Be(value);
        }
    }
}
