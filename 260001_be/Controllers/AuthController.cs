using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using BCrypt.Net;
using JobTracker.Api.Data;
using JobTracker.Api.DTOs;
using JobTracker.Api.Models;

namespace JobTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly JobTrackerDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(JobTrackerDbContext context, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Validate request
                if (string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.Username) ||
                    string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Email, username, and password are required"
                    });
                }

                if (request.Password != request.ConfirmPassword)
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Passwords do not match"
                    });
                }

                if (request.Password.Length < 6)
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Password must be at least 6 characters long"
                    });
                }

                // Check if email already exists
                if (_context.Users.Any(u => u.Email == request.Email))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Email already registered"
                    });
                }

                // Check if username already exists
                if (_context.Users.Any(u => u.Username == request.Username))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Username already taken"
                    });
                }

                // Create new user
                var user = new User
                {
                    Email = request.Email,
                    Username = request.Username,
                    PasswordHash = HashPassword(request.Password),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Generate JWT token
                var token = GenerateJwtToken(user);

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "Registration successful",
                    Token = token,
                    User = new UserInfo
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Username = user.Username
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred during registration"
                });
            }
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate request
                if (string.IsNullOrWhiteSpace(request.EmailOrUsername) ||
                    string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "Email/username and password are required"
                    });
                }

                // Find user by email or username
                var user = _context.Users.FirstOrDefault(u =>
                    u.Email == request.EmailOrUsername ||
                    u.Username == request.EmailOrUsername);

                if (user == null)
                {
                    return Unauthorized(new AuthResponse
                    {
                        Success = false,
                        Message = "Invalid email/username or password"
                    });
                }

                // Verify password
                if (!VerifyPassword(request.Password, user.PasswordHash))
                {
                    return Unauthorized(new AuthResponse
                    {
                        Success = false,
                        Message = "Invalid email/username or password"
                    });
                }

                // Generate JWT token
                var token = GenerateJwtToken(user);

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    User = new UserInfo
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Username = user.Username
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred during login"
                });
            }
        }

        // Helper methods
        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
        }

        private bool VerifyPassword(string password, string hash)
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

        private string GenerateJwtToken(User user)
        {
            var jwtSecret = _configuration["Jwt:Secret"] ?? "your-secret-key-change-this-in-production-must-be-at-least-32-chars-long";
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "JobTrackerAPI";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "JobTrackerApp";
            var expirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "1440");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(jwtSecret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new System.Security.Claims.ClaimsIdentity(new System.Security.Claims.Claim[]
                {
                    new System.Security.Claims.Claim("sub", user.Id.ToString()),
                    new System.Security.Claims.Claim("email", user.Email),
                    new System.Security.Claims.Claim("username", user.Username)
                }),
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // GET: api/auth/test (public endpoint for debugging)
        [HttpGet("test")]
        [AllowAnonymous]
        public ActionResult<object> Test()
        {
            return Ok(new
            {
                message = "Backend is working correctly",
                timestamp = DateTime.UtcNow,
                cors = "CORS is configured"
            });
        }
    }
}
