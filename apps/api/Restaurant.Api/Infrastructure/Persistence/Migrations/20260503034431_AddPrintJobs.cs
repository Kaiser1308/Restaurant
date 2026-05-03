using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Restaurant.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPrintJobs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "image_object_key",
                table: "menu_items",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "print_jobs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    entity_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    printer_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    print_key = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    content_json = table.Column<string>(type: "text", nullable: false),
                    error_message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    retry_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    printed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_print_jobs", x => x.id);
                    table.ForeignKey(
                        name: "fk_print_jobs_tenants_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_print_jobs_tenant_id_created_at",
                table: "print_jobs",
                columns: new[] { "tenant_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_print_jobs_tenant_id_print_key",
                table: "print_jobs",
                columns: new[] { "tenant_id", "print_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_print_jobs_tenant_id_printer_type_status",
                table: "print_jobs",
                columns: new[] { "tenant_id", "printer_type", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_print_jobs_tenant_id_status",
                table: "print_jobs",
                columns: new[] { "tenant_id", "status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "print_jobs");

            migrationBuilder.DropColumn(
                name: "image_object_key",
                table: "menu_items");
        }
    }
}
