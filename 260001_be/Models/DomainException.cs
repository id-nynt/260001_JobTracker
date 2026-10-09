namespace JobTracker.Api.Models
{
    /// <summary>
    /// Thrown when a domain rule is violated. Mapped to HTTP 400 by DomainExceptionHandler.
    /// </summary>
    public sealed class DomainException : Exception
    {
        public DomainException(string message) : base(message) { }
    }
}
