# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project file
COPY JobTracker.Api.csproj .

# Restore dependencies
RUN dotnet restore

# Copy all source code
COPY . .

# Build for Release
RUN dotnet publish -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copy published app from build stage
COPY --from=build /app/out .

# Port configuration for Render
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

# Start the app
CMD ["dotnet", "JobTracker.Api.dll"]