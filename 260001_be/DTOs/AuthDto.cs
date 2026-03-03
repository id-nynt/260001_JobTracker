namespace JobTracker.Api.DTOs
{
    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string EmailOrUsername { get; set; } = string.Empty;

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
