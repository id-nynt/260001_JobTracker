using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using JobTracker.Api.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Get JWT secret from configuration
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "your-secret-key-change-this-in-production-must-be-at-least-32-chars-long";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "JobTrackerAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "JobTrackerApp";

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext
builder.Services.AddDbContext<JobTrackerDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

// Add Authorization
builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Migrate database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<JobTrackerDbContext>();
    db.Database.Migrate();

    // Ensure Default group exists
    if (!await db.Periods.AnyAsync(p => p.Name == "Default"))
    {
        var defaultGroup = new JobTracker.Api.Models.Period
        {
            Name = "Default",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Periods.Add(defaultGroup);
        await db.SaveChangesAsync();
    }
}

app.Run();

