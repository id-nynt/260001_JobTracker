using System.ComponentModel.DataAnnotations;

namespace JobTracker.Api.DTOs
{
    public class RegisterRequest
    {
        [Required, EmailAddress, StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required, StringLength(100, MinimumLength = 3)]
        public string Username { get; set; } = string.Empty;

        // BCrypt only uses the first 72 bytes, so longer passwords are rejected
        [Required, StringLength(72, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 72 characters long")]
        public string Password { get; set; } = string.Empty;

        [Compare(nameof(Password), ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [Required]
        public string EmailOrUsername { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public string? Token { get; set; }

        public UserInfo? User { get; set; }
    }

    public class UserInfo
    {
        public int Id { get; set; }

        public string Email { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty;
    }
}
