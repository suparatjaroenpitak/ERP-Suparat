using System.ComponentModel.DataAnnotations;

namespace ERP.Domain.Entities;

public class Customer
{
    public Guid Id { get; set; }
    [MaxLength(200)]
    public string Name { get; set; } = null!;
    [MaxLength(50)]
    public string? Phone { get; set; }
    public int PointsBalance { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<LoyaltyPointTransaction> LoyaltyTransactions { get; set; } = new List<LoyaltyPointTransaction>();
}
