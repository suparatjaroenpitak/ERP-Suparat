namespace ERP.Application.DTOs;

public class InventoryLineDto
{
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
}

public class InventoryTransactionRequest
{
    public string? Reference { get; set; }
    public Guid? WarehouseFromId { get; set; }
    public Guid? WarehouseToId { get; set; }
    public List<InventoryLineDto> Lines { get; set; } = new List<InventoryLineDto>();
}

public class StockBalanceDto
{
    public Guid ProductId { get; set; }
    public string? ProductName { get; set; }
    public Guid WarehouseId { get; set; }
    public decimal Quantity { get; set; }
}
