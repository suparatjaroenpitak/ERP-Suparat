namespace ERP.Application.DTOs;

public record ProductDto(Guid Id, string SKU, string Name, decimal Price);

public class CreateProductRequest
{
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
}
