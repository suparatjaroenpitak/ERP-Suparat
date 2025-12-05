namespace ERP.Domain.Entities;

public class Return
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public decimal RefundAmount { get; set; }

    public ICollection<ReturnItem> Items { get; set; } = new List<ReturnItem>();
}
