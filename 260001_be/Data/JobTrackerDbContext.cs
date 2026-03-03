using Microsoft.EntityFrameworkCore;
using JobTracker.Api.Models;

namespace JobTracker.Api.Data
{
    public class JobTrackerDbContext : DbContext
    {
        public JobTrackerDbContext(DbContextOptions<JobTrackerDbContext> options)
            : base(options)
        {
        }

        public DbSet<JobApplication> JobApplications { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Period> Periods { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Period entity
            modelBuilder.Entity<Period>()
                .HasKey(p => p.Id);

            modelBuilder.Entity<Period>()
                .Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Period>()
                .HasMany(p => p.JobApplications)
                .WithOne(j => j.Period)
                .HasForeignKey(j => j.PeriodId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure User entity
            modelBuilder.Entity<User>()
                .HasKey(u => u.Id);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(255);

            modelBuilder.Entity<User>()
                .Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<User>()
                .Property(u => u.PasswordHash)
                .IsRequired();

            // Configure JobApplication entity
            modelBuilder.Entity<JobApplication>()
                .HasKey(j => j.Id);

            modelBuilder.Entity<JobApplication>()
                .Property(j => j.CompanyName)
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<JobApplication>()
                .Property(j => j.JobTitle)
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<JobApplication>()
                .Property(j => j.Status)
                .IsRequired()
                .HasMaxLength(50);
        }
    }
}
