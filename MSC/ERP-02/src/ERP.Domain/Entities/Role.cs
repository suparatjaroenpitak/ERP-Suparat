using System.ComponentModel.DataAnnotations;

namespace ERP.Domain.Entities;

public class Role
{
    public Guid Id { get; set; }
    [MaxLength(100)]
    public string Name { get; set; } = null!;

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
