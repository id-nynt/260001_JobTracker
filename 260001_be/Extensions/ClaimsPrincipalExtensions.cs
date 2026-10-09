using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace JobTracker.Api.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        /// <summary>
        /// Reads the authenticated user's id from the JWT "sub" claim.
        /// JwtBearer is configured with MapInboundClaims = false, so the claim keeps its short name.
        /// </summary>
        public static int GetUserId(this ClaimsPrincipal principal)
        {
            var value = principal.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (!int.TryParse(value, out var userId))
                throw new UnauthorizedAccessException("The token does not contain a valid user id.");

            return userId;
        }
    }
}
