namespace ERP.Application.DTOs;

// Non-conflicting summary DTO used where a lightweight shape is needed.
public record ProductSummaryDto(Guid Id, string SKU, string Name, decimal Price);

public class CreateProductSummaryRequest
{
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
}
