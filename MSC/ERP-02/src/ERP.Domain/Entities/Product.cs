namespace ERP.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Description { get; set; }
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public Guid? UnitId { get; set; }
    public Unit? Unit { get; set; }
    public Guid? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public Guid? BranchId { get; set; }
    public Branch? Branch { get; set; }
    public string? ImageUrl { get; set; }
}
