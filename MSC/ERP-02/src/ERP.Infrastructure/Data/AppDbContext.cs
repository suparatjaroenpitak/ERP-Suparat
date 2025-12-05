using Microsoft.EntityFrameworkCore;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Return> Returns => Set<Return>();
    public DbSet<ReturnItem> ReturnItems => Set<ReturnItem>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<LoyaltyPointTransaction> LoyaltyPointTransactions => Set<LoyaltyPointTransaction>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
    public DbSet<InventoryTransactionLine> InventoryTransactionLines => Set<InventoryTransactionLine>();
    public DbSet<StockBalance> StockBalances => Set<StockBalance>();
    public DbSet<MinStock> MinStocks => Set<MinStock>();
    public DbSet<PurchaseRequest> PurchaseRequests => Set<PurchaseRequest>();
    public DbSet<PurchaseRequestLine> PurchaseRequestLines => Set<PurchaseRequestLine>();
    public DbSet<ApprovalFlow> ApprovalFlows => Set<ApprovalFlow>();
    public DbSet<ApprovalStep> ApprovalSteps => Set<ApprovalStep>();
    public DbSet<ApprovalHistory> ApprovalHistories => Set<ApprovalHistory>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderLine> PurchaseOrderLines => Set<PurchaseOrderLine>();
    public DbSet<Quotation> Quotations => Set<Quotation>();
    public DbSet<QuotationLine> QuotationLines => Set<QuotationLine>();
    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();
    public DbSet<SalesOrderLine> SalesOrderLines => Set<SalesOrderLine>();
    public DbSet<CustomerCredit> CustomerCredits => Set<CustomerCredit>();
    public DbSet<ArTransaction> ArTransactions => Set<ArTransaction>();
    public DbSet<GlAccount> GlAccounts => Set<GlAccount>();
    public DbSet<GlTemplate> GlTemplates => Set<GlTemplate>();
    public DbSet<GlTemplateLine> GlTemplateLines => Set<GlTemplateLine>();
    public DbSet<GlTransactionHeader> GlTransactionHeaders => Set<GlTransactionHeader>();
    public DbSet<GlTransactionLine> GlTransactionLines => Set<GlTransactionLine>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.SKU).HasMaxLength(50).IsRequired();
            b.HasIndex(x => x.SKU).IsUnique();
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<Order>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
            b.Property(x => x.TotalDiscount).HasColumnType("decimal(18,2)");
            b.HasMany(x => x.Items).WithOne(x => x.Order).HasForeignKey(x => x.OrderId);
        });

        modelBuilder.Entity<OrderItem>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            b.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            b.Property(x => x.DiscountAmount).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Return>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasMany(x => x.Items).WithOne(x => x.Return).HasForeignKey(x => x.ReturnId);
            b.Property(x => x.RefundAmount).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<ReturnItem>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.OrderItem).WithMany().HasForeignKey(x => x.OrderItemId).OnDelete(DeleteBehavior.Restrict);
            b.Property(x => x.RefundAmount).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Customer>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.Phone).HasMaxLength(50).IsRequired(false);
            b.Property(x => x.PointsBalance).HasDefaultValue(0);
        });

        modelBuilder.Entity<LoyaltyPointTransaction>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.Customer).WithMany(c => c.LoyaltyTransactions).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade);
            b.Property(x => x.PointsChange);
            b.Property(x => x.Type).IsRequired();
            b.Property(x => x.Description).HasMaxLength(500).IsRequired(false);
        });

        modelBuilder.Entity<InventoryTransaction>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Reference).HasMaxLength(200).IsRequired(false);
            b.HasMany(x => x.Lines).WithOne(x => x.InventoryTransaction).HasForeignKey(x => x.InventoryTransactionId);
        });

        modelBuilder.Entity<InventoryTransactionLine>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            b.Property(x => x.Quantity).HasColumnType("decimal(18,3)");
            b.Property(x => x.UnitCost).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<StockBalance>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.ProductId, x.WarehouseId }).IsUnique();
            b.Property(x => x.Quantity).HasColumnType("decimal(18,3)");
            b.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });
        
        modelBuilder.Entity<MinStock>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.MinQuantity).HasColumnType("decimal(18,4)");
            b.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
            b.HasIndex(x => new { x.ProductId, x.WarehouseId }).IsUnique(false);
        });

        modelBuilder.Entity<PurchaseRequest>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Number).HasMaxLength(100).IsRequired();
            b.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            b.Property(x => x.Status).HasConversion<int>();
        });

        modelBuilder.Entity<PurchaseRequestLine>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Quantity).HasColumnType("decimal(18,4)");
            b.Property(x => x.UnitPrice).HasColumnType("decimal(18,4)");
            b.HasOne(x => x.PurchaseRequest).WithMany(p => p.Lines).HasForeignKey(x => x.PurchaseRequestId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ApprovalFlow>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.Module).HasMaxLength(200).IsRequired();
            b.Property(x => x.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<ApprovalStep>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.StepNumber).IsRequired();
            b.Property(x => x.MinAmount).HasColumnType("decimal(18,4)");
            b.Property(x => x.MaxAmount).HasColumnType("decimal(18,4)");
            b.HasOne(x => x.ApprovalFlow).WithMany(f => f.Steps).HasForeignKey(x => x.ApprovalFlowId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ApprovalHistory>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Module).HasMaxLength(200).IsRequired();
            b.Property(x => x.Amount).HasColumnType("decimal(18,4)");
            b.Property(x => x.Decision).HasConversion<int>();
            b.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            b.HasOne(x => x.ApprovalFlow).WithMany().HasForeignKey(x => x.ApprovalFlowId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.ApprovalStep).WithMany().HasForeignKey(x => x.ApprovalStepId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PurchaseOrder>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Number).HasMaxLength(100).IsRequired();
            b.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            b.Property(x => x.Status).HasConversion<int>();
        });

        modelBuilder.Entity<PurchaseOrderLine>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Quantity).HasColumnType("decimal(18,4)");
            b.Property(x => x.ReceivedQuantity).HasColumnType("decimal(18,4)");
            b.Property(x => x.UnitPrice).HasColumnType("decimal(18,4)");
            b.HasOne(x => x.PurchaseOrder).WithMany(p => p.Lines).HasForeignKey(x => x.PurchaseOrderId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Quotation>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Number).HasMaxLength(100).IsRequired();
            b.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            b.Property(x => x.Status).HasConversion<int>();
        });

        modelBuilder.Entity<QuotationLine>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Quantity).HasColumnType("decimal(18,4)");
            b.Property(x => x.UnitPrice).HasColumnType("decimal(18,4)");
            b.HasOne(x => x.Quotation).WithMany(q => q.Lines).HasForeignKey(x => x.QuotationId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SalesOrder>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Number).HasMaxLength(100).IsRequired();
            b.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            b.Property(x => x.Status).HasConversion<int>();
        });

        modelBuilder.Entity<SalesOrderLine>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Quantity).HasColumnType("decimal(18,4)");
            b.Property(x => x.ShippedQuantity).HasColumnType("decimal(18,4)");
            b.Property(x => x.UnitPrice).HasColumnType("decimal(18,4)");
            b.HasOne(x => x.SalesOrder).WithMany(s => s.Lines).HasForeignKey(x => x.SalesOrderId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CustomerCredit>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.CreditLimit).HasColumnType("decimal(18,4)");
            b.Property(x => x.CurrentBalance).HasColumnType("decimal(18,4)");
            b.HasIndex(x => x.CustomerId).IsUnique();
        });

        modelBuilder.Entity<ArTransaction>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Amount).HasColumnType("decimal(18,4)");
            b.Property(x => x.Date).HasDefaultValueSql("GETUTCDATE()");
            b.Property(x => x.Type).HasConversion<int>();
            b.HasIndex(x => x.CustomerId);
        });

        modelBuilder.Entity<GlAccount>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Code).HasMaxLength(50).IsRequired();
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder.Entity<GlTemplate>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.Module).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<GlTemplateLine>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.AccountCode).HasMaxLength(50).IsRequired();
            b.Property(x => x.AmountFormula).HasMaxLength(200).IsRequired();
            b.HasOne(x => x.GlTemplate).WithMany(t => t.Lines).HasForeignKey(x => x.GlTemplateId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<GlTransactionHeader>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Number).HasMaxLength(100).IsRequired();
            b.Property(x => x.Date).HasDefaultValueSql("GETUTCDATE()");
            b.Property(x => x.Module).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<GlTransactionLine>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Debit).HasColumnType("decimal(18,4)");
            b.Property(x => x.Credit).HasColumnType("decimal(18,4)");
            b.HasOne(x => x.GlTransactionHeader).WithMany(h => h.Lines).HasForeignKey(x => x.GlTransactionHeaderId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne(x => x.Account).WithMany().HasForeignKey(x => x.AccountId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.Username).IsUnique();
            b.Property(x => x.Username).HasMaxLength(100).IsRequired();
            b.Property(x => x.PasswordHash).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<Role>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(100).IsRequired();
            b.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<Permission>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<UserRole>(b =>
        {
            b.HasKey(x => new { x.UserId, x.RoleId });
            b.HasOne(ur => ur.User).WithMany(u => u.UserRoles).HasForeignKey(ur => ur.UserId);
            b.HasOne(ur => ur.Role).WithMany(r => r.UserRoles).HasForeignKey(ur => ur.RoleId);
        });

        modelBuilder.Entity<RolePermission>(b =>
        {
            b.HasKey(x => new { x.RoleId, x.PermissionId });
            b.HasOne(rp => rp.Role).WithMany(r => r.RolePermissions).HasForeignKey(rp => rp.RoleId);
            b.HasOne(rp => rp.Permission).WithMany(p => p.RolePermissions).HasForeignKey(rp => rp.PermissionId);
        });

        modelBuilder.Entity<Category>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.HasIndex(x => x.Name).IsUnique(false);
        });

        modelBuilder.Entity<Unit>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(50).IsRequired();
        });

        modelBuilder.Entity<Warehouse>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<Branch>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<Product>(b =>
        {
            b.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.SetNull);
            b.HasOne(p => p.Unit).WithMany(u => u.Products).HasForeignKey(p => p.UnitId).OnDelete(DeleteBehavior.SetNull);
            b.HasOne(p => p.Warehouse).WithMany(w => w.Products).HasForeignKey(p => p.WarehouseId).OnDelete(DeleteBehavior.SetNull);
            b.HasOne(p => p.Branch).WithMany(bc => bc.Products).HasForeignKey(p => p.BranchId).OnDelete(DeleteBehavior.SetNull);
            b.Property(x => x.Description).HasMaxLength(2000).IsRequired(false);
            b.Property(x => x.ImageUrl).HasMaxLength(1000).IsRequired(false);
        });

        base.OnModelCreating(modelBuilder);
    }
}
