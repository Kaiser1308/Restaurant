using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.Infrastructure.Auth;

namespace Restaurant.Api.Infrastructure.Persistence;

public sealed class RestaurantDbContext(
    DbContextOptions<RestaurantDbContext> options,
    ITenantContext tenantContext) : DbContext(options)
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<RestaurantTable> RestaurantTables => Set<RestaurantTable>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Bill> Bills => Set<Bill>();
    public DbSet<BillItem> BillItems => Set<BillItem>();
    public DbSet<VoidLog> VoidLogs => Set<VoidLog>();
    public DbSet<BillNumberSequence> BillNumberSequences => Set<BillNumberSequence>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<PrintJob> PrintJobs => Set<PrintJob>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.Property(x => x.UpdatedAt).IsRequired();

            entity.HasIndex(x => x.Status);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Username).HasMaxLength(100).IsRequired();
            entity.Property(x => x.PasswordHash).IsRequired();
            entity.Property(x => x.Role).HasConversion<string>().HasMaxLength(50);
            entity.Property(x => x.IsActive).HasDefaultValue(true);
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.Property(x => x.UpdatedAt).IsRequired();

            entity.HasIndex(x => new { x.TenantId, x.Username }).IsUnique();
            entity.HasIndex(x => x.TenantId);
            entity.HasIndex(x => new { x.TenantId, x.Role });

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.Users)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.TokenHash).IsRequired();
            entity.Property(x => x.ExpiresAt).IsRequired();
            entity.Property(x => x.CreatedAt).IsRequired();

            entity.HasIndex(x => new { x.TenantId, x.UserId });
            entity.HasIndex(x => x.ExpiresAt);

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.RefreshTokens)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.User)
                .WithMany(x => x.RefreshTokens)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RestaurantTable>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.Property(x => x.UpdatedAt).IsRequired();

            entity.HasIndex(x => new { x.TenantId, x.Name }).IsUnique();
            entity.HasIndex(x => new { x.TenantId, x.Status });

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.RestaurantTables)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(x => !tenantContext.IsAuthenticated || x.TenantId == tenantContext.TenantId);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(150).IsRequired();
            entity.Property(x => x.SortOrder).HasDefaultValue(0);
            entity.Property(x => x.IsActive).HasDefaultValue(true);
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.Property(x => x.UpdatedAt).IsRequired();

            entity.HasIndex(x => new { x.TenantId, x.Name }).IsUnique();
            entity.HasIndex(x => new { x.TenantId, x.IsActive });

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.Categories)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(x => !tenantContext.IsAuthenticated || x.TenantId == tenantContext.TenantId);
        });

        modelBuilder.Entity<MenuItem>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Price).HasPrecision(18, 2);
            entity.Property(x => x.Description).HasMaxLength(1000);
            entity.Property(x => x.IsAvailable).HasDefaultValue(true);
            entity.Property(x => x.IsActive).HasDefaultValue(true);
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.Property(x => x.UpdatedAt).IsRequired();
            entity.Property(x => x.ImageObjectKey).HasMaxLength(500);

            entity.HasIndex(x => new { x.TenantId, x.CategoryId });
            entity.HasIndex(x => new { x.TenantId, x.IsAvailable });
            entity.HasIndex(x => new { x.TenantId, x.IsActive });

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.MenuItems)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Category)
                .WithMany(x => x.MenuItems)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(x => !tenantContext.IsAuthenticated || x.TenantId == tenantContext.TenantId);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.Property(x => x.UpdatedAt).IsRequired();

            entity.HasIndex(x => new { x.TenantId, x.TableId, x.Status });
            entity.HasIndex(x => new { x.TenantId, x.CreatedAt });
            entity.HasIndex(x => new { x.TenantId, x.Status });

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Table)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.TableId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.CreatedByUser)
                .WithMany(x => x.CreatedOrders)
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(x => !tenantContext.IsAuthenticated || x.TenantId == tenantContext.TenantId);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ItemNameSnapshot).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Quantity).IsRequired();
            entity.Property(x => x.UnitPrice).HasPrecision(18, 2);
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
            entity.Property(x => x.CancelReason).HasMaxLength(1000);
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.Property(x => x.UpdatedAt).IsRequired();

            entity.HasIndex(x => new { x.TenantId, x.OrderId });
            entity.HasIndex(x => new { x.TenantId, x.Status });
            entity.HasIndex(x => new { x.TenantId, x.CreatedAt });

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.OrderItems)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Order)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.MenuItem)
                .WithMany(x => x.OrderItems)
                .HasForeignKey(x => x.MenuItemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.CancelledByUser)
                .WithMany(x => x.CancelledOrderItems)
                .HasForeignKey(x => x.CancelledByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(x => !tenantContext.IsAuthenticated || x.TenantId == tenantContext.TenantId);
        });

        modelBuilder.Entity<Bill>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.BillNumber).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
            entity.Property(x => x.PaymentType).HasConversion<string>().HasMaxLength(50);
            entity.Property(x => x.TotalAmount).HasPrecision(18, 2);
            entity.Property(x => x.PaidAt).IsRequired();
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.Property(x => x.UpdatedAt).IsRequired();

            entity.HasIndex(x => new { x.TenantId, x.BillNumber }).IsUnique();
            entity.HasIndex(x => new { x.TenantId, x.OrderId }).IsUnique();
            entity.HasIndex(x => new { x.TenantId, x.PaidAt });
            entity.HasIndex(x => new { x.TenantId, x.Status });
            entity.HasIndex(x => new { x.TenantId, x.PaymentType });

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.Bills)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Order)
                .WithOne(x => x.Bill)
                .HasForeignKey<Bill>(x => x.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.PaidByUser)
                .WithMany(x => x.PaidBills)
                .HasForeignKey(x => x.PaidByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.VoidedByUser)
                .WithMany(x => x.VoidedBills)
                .HasForeignKey(x => x.VoidedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(x => !tenantContext.IsAuthenticated || x.TenantId == tenantContext.TenantId);
        });

        modelBuilder.Entity<BillItem>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ItemNameSnapshot).HasMaxLength(200).IsRequired();
            entity.Property(x => x.UnitPriceSnapshot).HasPrecision(18, 2);
            entity.Property(x => x.LineTotal).HasPrecision(18, 2);
            entity.Property(x => x.CreatedAt).IsRequired();

            entity.HasIndex(x => new { x.TenantId, x.BillId });

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.BillItems)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Bill)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.BillId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.OrderItem)
                .WithMany(x => x.BillItems)
                .HasForeignKey(x => x.OrderItemId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(x => !tenantContext.IsAuthenticated || x.TenantId == tenantContext.TenantId);
        });

        modelBuilder.Entity<VoidLog>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Reason).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.CreatedAt).IsRequired();

            entity.HasIndex(x => new { x.TenantId, x.BillId });
            entity.HasIndex(x => new { x.TenantId, x.CreatedAt });
            entity.HasIndex(x => new { x.TenantId, x.UserId });

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.VoidLogs)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Bill)
                .WithMany(x => x.VoidLogs)
                .HasForeignKey(x => x.BillId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.User)
                .WithMany(x => x.VoidLogs)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(x => !tenantContext.IsAuthenticated || x.TenantId == tenantContext.TenantId);
        });

        modelBuilder.Entity<BillNumberSequence>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Date).IsRequired();
            entity.Property(x => x.LastSequence).HasDefaultValue(0);

            entity.HasIndex(x => new { x.TenantId, x.Date }).IsUnique();

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.BillNumberSequences)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(x => !tenantContext.IsAuthenticated || x.TenantId == tenantContext.TenantId);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Action).HasMaxLength(100).IsRequired();
            entity.Property(x => x.EntityType).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Reason).HasMaxLength(1000);
            entity.Property(x => x.CreatedAt).IsRequired();

            entity.HasIndex(x => new { x.TenantId, x.CreatedAt });
            entity.HasIndex(x => new { x.TenantId, x.Action });

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.AuditLogs)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.User)
                .WithMany(x => x.AuditLogs)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(x => !tenantContext.IsAuthenticated || x.TenantId == tenantContext.TenantId);
        });

        modelBuilder.Entity<PrintJob>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.EntityType).HasMaxLength(50).IsRequired();
            entity.Property(x => x.PrinterType).HasConversion<string>().HasMaxLength(50);
            entity.Property(x => x.PrintKey).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(50).HasDefaultValue(PrintJobStatus.Pending);
            entity.Property(x => x.ContentJson).IsRequired();
            entity.Property(x => x.ErrorMessage).HasMaxLength(2000);
            entity.Property(x => x.RetryCount).HasDefaultValue(0);
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.Property(x => x.UpdatedAt).IsRequired();

            entity.HasIndex(x => new { x.TenantId, x.PrintKey }).IsUnique();
            entity.HasIndex(x => new { x.TenantId, x.Status });
            entity.HasIndex(x => new { x.TenantId, x.PrinterType, x.Status });
            entity.HasIndex(x => new { x.TenantId, x.CreatedAt });

            entity.HasOne(x => x.Tenant)
                .WithMany(x => x.PrintJobs)
                .HasForeignKey(x => x.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(x => !tenantContext.IsAuthenticated || x.TenantId == tenantContext.TenantId);
        });
    }
}
