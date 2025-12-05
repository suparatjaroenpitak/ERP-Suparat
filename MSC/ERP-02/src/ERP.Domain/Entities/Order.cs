namespace ERP.Domain.Entities;

public enum OrderStatus
{
    Draft = 0,
    Completed = 1,
    Voided = 2,
    Returned = 3
}

public class Order
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Draft;
    public decimal TotalAmount { get; set; }
    public decimal TotalDiscount { get; set; }
    public Guid? UserId { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
