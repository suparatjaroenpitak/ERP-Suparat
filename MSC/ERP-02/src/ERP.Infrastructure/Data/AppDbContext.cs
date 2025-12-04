using Microsoft.EntityFrameworkCore;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.SKU).HasMaxLength(50).IsRequired();
            b.HasIndex(x => x.SKU).IsUnique();
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });

        base.OnModelCreating(modelBuilder);
    }
}
