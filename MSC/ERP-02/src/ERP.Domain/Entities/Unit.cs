using System.ComponentModel.DataAnnotations;

namespace ERP.Domain.Entities;

public class Unit
{
    public Guid Id { get; set; }
    [MaxLength(50)]
    public string Name { get; set; } = null!;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
