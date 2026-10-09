# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore first so this layer is cached until the project file changes
COPY JobTracker.Api.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/out --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Render sends traffic to port 10000 by default
ENV ASPNETCORE_HTTP_PORTS=10000
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 10000

# Do not run as root (the "app" user is built into the .NET 8 images)
USER app

# Configuration (ConnectionStrings__DefaultConnection, Jwt__Secret, Cors__AllowedOrigins__0) comes from environment variables
ENTRYPOINT ["dotnet", "JobTracker.Api.dll"]
