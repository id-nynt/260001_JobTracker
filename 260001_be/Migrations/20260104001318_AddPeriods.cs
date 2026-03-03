using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPeriods : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PeriodId",
                table: "JobApplications",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Periods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    DateStart = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DateEnd = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Periods", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_JobApplications_PeriodId",
                table: "JobApplications",
                column: "PeriodId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobApplications_Periods_PeriodId",
                table: "JobApplications",
                column: "PeriodId",
                principalTable: "Periods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobApplications_Periods_PeriodId",
                table: "JobApplications");

            migrationBuilder.DropTable(
                name: "Periods");

            migrationBuilder.DropIndex(
                name: "IX_JobApplications_PeriodId",
                table: "JobApplications");

            migrationBuilder.DropColumn(
                name: "PeriodId",
                table: "JobApplications");
        }
    }
}
