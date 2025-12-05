namespace ERP.Domain.Entities;

public enum InventoryTransactionType
{
    Receive = 0,
    Issue = 1,
    Transfer = 2
}

public class InventoryTransaction
{
    public Guid Id { get; set; }
    public InventoryTransactionType Type { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Reference { get; set; }
    public Guid? WarehouseFromId { get; set; }
    public Guid? WarehouseToId { get; set; }
    public ICollection<InventoryTransactionLine> Lines { get; set; } = new List<InventoryTransactionLine>();
}
