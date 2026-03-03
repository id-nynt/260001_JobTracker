# Job Tracker Backend

ASP.NET 8 Web API for the Job Application Tracker

## Features

- RESTful API for managing job applications
- Entity Framework Core with SQL Server
- CORS enabled for frontend communication
- Swagger documentation
- Full CRUD operations

## Prerequisites

- .NET 8 SDK
- SQL Server (LocalDB or full instance)

## Setup

1. Restore NuGet packages:
   \`\`\`
   dotnet restore
   \`\`\`

2. Create and migrate the database:
   \`\`\`
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   \`\`\`

3. Run the application:
   \`\`\`
   dotnet run
   \`\`\`

The API will be available at https://localhost:5000

## API Endpoints

- \`GET /api/jobs\` - Get all job applications
- \`GET /api/jobs/{id}\` - Get a specific job application
- \`POST /api/jobs\` - Create a new job application
- \`PUT /api/jobs/{id}\` - Update a job application
- \`DELETE /api/jobs/{id}\` - Delete a job application

## Configuration

Update \`appsettings.json\` with your SQL Server connection string.
