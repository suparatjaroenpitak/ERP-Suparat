namespace ERP.Domain.Entities;

public enum LoyaltyTransactionType
{
    Earn = 0,
    Redeem = 1
}

public class LoyaltyPointTransaction
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int PointsChange { get; set; }
    public LoyaltyTransactionType Type { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid? OrderId { get; set; }
}
