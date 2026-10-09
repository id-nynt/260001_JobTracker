using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using JobTracker.Api.DTOs;

namespace JobTracker.Api.Tests.Api
{
    public class AuthEndpointsTests : IClassFixture<ApiFactory>
    {
        private readonly ApiFactory _factory;

        public AuthEndpointsTests(ApiFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Registering_returns_a_working_token_and_gives_the_user_a_default_period()
        {
            var user = await TestUser.RegisterAsync(_factory);

            var periods = await user.GetPeriodsAsync();

            var period = periods.Should().ContainSingle().Subject;
            period.Name.Should().Be("Default");
            period.IsDefault.Should().BeTrue();
            period.Count.Should().Be(0);
        }

        [Fact]
        public async Task Registering_rejects_an_email_or_username_that_is_taken_whatever_the_email_casing()
        {
            var existing = await TestUser.RegisterAsync(_factory);
            var client = _factory.CreateClient();

            var sameEmail = await client.PostAsJsonAsync("/api/auth/register",
                Registration(existing.Email.ToUpperInvariant(), "someone-else"));
            var sameUsername = await client.PostAsJsonAsync("/api/auth/register",
                Registration("other@example.com", existing.Username));

            (await Detail(sameEmail)).Should().Be("Email already registered");
            (await Detail(sameUsername)).Should().Be("Username already taken");
        }

        [Theory]
        [InlineData("a@example.com", "short", "short", "Password must be between 8 and 72 characters long")]
        [InlineData("a@example.com", "long-enough-1", "different-1", "Passwords do not match")]
        public async Task Registering_rejects_invalid_input_with_a_readable_message(string email, string password, string confirm, string expected)
        {
            var response = await _factory.CreateClient().PostAsJsonAsync("/api/auth/register",
                Registration(email, "valid" + Guid.NewGuid().ToString("N")[..8], password, confirm));

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            (await Detail(response)).Should().Be(expected);
        }

        [Fact]
        public async Task Login_accepts_username_or_email_and_gives_no_hint_about_which_part_was_wrong()
        {
            var user = await TestUser.RegisterAsync(_factory);
            var client = _factory.CreateClient();

            var byUsername = await Login(client, user.Username, TestUser.Password);
            var byEmail = await Login(client, user.Email.ToUpperInvariant(), TestUser.Password);
            var wrongPassword = await Login(client, user.Username, "wrong-password");
            var unknownUser = await Login(client, "nobody-" + Guid.NewGuid().ToString("N"), TestUser.Password);

            byUsername.StatusCode.Should().Be(HttpStatusCode.OK);
            byEmail.StatusCode.Should().Be(HttpStatusCode.OK);
            wrongPassword.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            unknownUser.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            (await Detail(unknownUser)).Should().Be(await Detail(wrongPassword));
        }

        [Theory]
        [InlineData("no token")]
        [InlineData("signed with another key")]
        [InlineData("expired")]
        public async Task Protected_endpoints_reject_missing_forged_and_expired_tokens(string scenario)
        {
            var client = _factory.CreateClient();
            var token = scenario switch
            {
                "signed with another key" => CreateToken("a-different-secret-that-is-also-long-enough", DateTime.UtcNow.AddHours(1)),
                "expired" => CreateToken(ApiFactory.JwtSecret, DateTime.UtcNow.AddHours(-1)),
                _ => null
            };
            if (token != null)
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            (await client.GetAsync("/api/jobs")).StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            (await client.GetAsync("/api/periods")).StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        private static object Registration(string email, string username, string password = TestUser.Password, string? confirm = null)
        {
            return new { email, username, password, confirmPassword = confirm ?? password };
        }

        private static Task<HttpResponseMessage> Login(HttpClient client, string emailOrUsername, string password)
        {
            return client.PostAsJsonAsync("/api/auth/login", new { emailOrUsername, password });
        }

        private static async Task<string?> Detail(HttpResponseMessage response)
        {
            return (await response.Content.ReadFromJsonAsync<ProblemDetails>())!.Detail;
        }

        // A token that is valid in every way except the one thing under test (signature or expiry)
        private static string CreateToken(string secret, DateTime expires)
        {
            var descriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim(JwtRegisteredClaimNames.Sub, "1") }),
                NotBefore = expires.AddHours(-2),
                Expires = expires,
                Issuer = "JobTrackerAPI",
                Audience = "JobTrackerApp",
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)), SecurityAlgorithms.HmacSha256)
            };

            var handler = new JwtSecurityTokenHandler();
            return handler.WriteToken(handler.CreateToken(descriptor));
        }
    }

    public class AuthRateLimitTests : IClassFixture<RateLimitedApiFactory>
    {
        private readonly RateLimitedApiFactory _factory;

        public AuthRateLimitTests(RateLimitedApiFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Repeated_login_attempts_are_throttled()
        {
            var client = _factory.CreateClient();

            for (var attempt = 0; attempt < RateLimitedApiFactory.Limit; attempt++)
            {
                var response = await client.PostAsJsonAsync("/api/auth/login", new { emailOrUsername = "x", password = "y" });
                response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            }

            var throttled = await client.PostAsJsonAsync("/api/auth/login", new { emailOrUsername = "x", password = "y" });
            throttled.StatusCode.Should().Be(HttpStatusCode.TooManyRequests);
        }
    }
}
