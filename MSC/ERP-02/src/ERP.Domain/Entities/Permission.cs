using System.ComponentModel.DataAnnotations;

namespace ERP.Domain.Entities;

public class Permission
{
    public Guid Id { get; set; }
    [MaxLength(200)]
    public string Name { get; set; } = null!;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
