namespace ERP.Application.DTOs;

public class InventoryAlertDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public Guid? WarehouseId { get; set; }
    public decimal Quantity { get; set; }
    public decimal MinQuantity { get; set; }
}
