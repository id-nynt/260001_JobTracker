using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using JobTracker.Api.Data;
using JobTracker.Api.DTOs;
using JobTracker.Api.Models;
using JobTracker.Api.Services;

namespace JobTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("auth")]
    public class AuthController : ControllerBase
    {
        private readonly JobTrackerDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthController(JobTrackerDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var username = request.Username.Trim();

            if (await _context.Users.AnyAsync(u => u.Email == email))
            {
                return Problem(detail: "Email already registered", statusCode: StatusCodes.Status400BadRequest);
            }

            if (await _context.Users.AnyAsync(u => u.Username == username))
            {
                return Problem(detail: "Username already taken", statusCode: StatusCodes.Status400BadRequest);
            }

            var user = new User
            {
                Email = email,
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12)
            };

            // Every user starts with their own default period, saved together with the user
            user.Periods.Add(new Period { Name = PeriodService.DefaultName, IsDefault = true });

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(BuildResponse(user, "Registration successful"));
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            var identifier = request.EmailOrUsername.Trim();
            var email = identifier.ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email || u.Username == identifier);

            // Same message for an unknown user and a wrong password
            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return Problem(detail: "Invalid email/username or password", statusCode: StatusCodes.Status401Unauthorized);
            }

            return Ok(BuildResponse(user, "Login successful"));
        }

        private AuthResponse BuildResponse(User user, string message)
        {
            return new AuthResponse
            {
                Success = true,
                Message = message,
                Token = _tokenService.CreateToken(user),
                User = new UserInfo
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username
                }
            };
        }

        private static bool VerifyPassword(string password, string hash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hash);
            }
            catch
            {
                return false;
            }
        }
    }
}
