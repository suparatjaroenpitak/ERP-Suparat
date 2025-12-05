namespace ERP.Domain.Entities;

public class InventoryTransactionLine
{
    public Guid Id { get; set; }
    public Guid InventoryTransactionId { get; set; }
    public InventoryTransaction InventoryTransaction { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
}
