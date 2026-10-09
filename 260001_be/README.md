# Job Tracker API

ASP.NET Core 8 Web API. Setup, API table and architecture: see the [root README](../README.md); deployment: [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).

```bash
dotnet user-secrets set "Jwt:Secret" "any-random-string-of-32-or-more-chars"   # once
dotnet run                                                                       # needs PostgreSQL, see root README
dotnet test ../260001_be.Tests
```

## Configuration

Environment variables use `__` for nesting (`Jwt__Secret`). Nothing secret lives in the repo.

| Setting | Purpose |
| --- | --- |
| `ConnectionStrings__DefaultConnection` | PostgreSQL: a normal connection string or a `postgresql://` URL |
| `Jwt__Secret` | Signing key, at least 32 characters. **Required**: the app will not start without it |
| `Jwt__Issuer`, `Jwt__Audience`, `Jwt__ExpirationMinutes` | Token settings (defaults in `appsettings.json`) |
| `Cors__AllowedOrigins__0`, `__1`, … | Frontend origins allowed to call the API |
| `RateLimiting__AuthPermitLimit` | Login/register attempts per IP per minute (default 10) |

## Layout

`Controllers/` HTTP endpoints, thin and scoped to the signed-in user · `Models/` entities with their own validation (`JobApplication.Create`) · `DTOs/` request/response shapes · `Services/` token creation and group bookkeeping · `Infrastructure/` error handling and connection-string parsing · `Migrations/` EF Core schema.

## Migrations

```bash
dotnet tool restore                                  # installs the pinned dotnet-ef
dotnet ef migrations add <Name>                      # after changing a model
```

Migrations are applied automatically when the API starts.
