using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Restaurant.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMenuItemImage : Migration
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "image_object_key",
                table: "menu_items");
        }
    }
}
