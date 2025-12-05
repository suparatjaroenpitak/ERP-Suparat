namespace ERP.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }

    // quantity that has been returned (for partial return tracking)
    public int ReturnedQuantity { get; set; }
}
