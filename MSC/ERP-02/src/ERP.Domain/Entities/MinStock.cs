namespace ERP.Domain.Entities;

public class MinStock
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Guid? WarehouseId { get; set; }
    public decimal MinQuantity { get; set; }
}
