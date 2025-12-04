using System.ComponentModel.DataAnnotations;

namespace ERP.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    [MaxLength(100)]
    public string Username { get; set; } = null!;
    [MaxLength(200)]
    public string PasswordHash { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
