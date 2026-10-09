using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using JobTracker.Api.Models;

namespace JobTracker.Api.Infrastructure
{
    /// <summary>
    /// Turns domain rule violations into 400 ProblemDetails responses,
    /// so controllers do not need their own try/catch blocks.
    /// </summary>
    public class DomainExceptionHandler : IExceptionHandler
    {
        private readonly IProblemDetailsService _problemDetails;

        public DomainExceptionHandler(IProblemDetailsService problemDetails)
        {
            _problemDetails = problemDetails;
        }

        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            if (exception is not DomainException)
                return false;

            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

            return await _problemDetails.TryWriteAsync(new ProblemDetailsContext
            {
                HttpContext = httpContext,
                Exception = exception,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Validation failed",
                    Detail = exception.Message
                }
            });
        }
    }
}
