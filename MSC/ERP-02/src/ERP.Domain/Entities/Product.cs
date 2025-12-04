namespace ERP.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
