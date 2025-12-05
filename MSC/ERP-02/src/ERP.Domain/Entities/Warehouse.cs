using System.ComponentModel.DataAnnotations;

namespace ERP.Domain.Entities;

public class Warehouse
{
    public Guid Id { get; set; }
    [MaxLength(200)]
    public string Name { get; set; } = null!;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
