namespace ERP.Application.DTOs;

public class ProductDto
{
    public Guid Id { get; set; }
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public string? Description { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public Guid? UnitId { get; set; }
    public string? UnitName { get; set; }
    public Guid? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public Guid? BranchId { get; set; }
    public string? BranchName { get; set; }
    public string? ImageUrl { get; set; }
}

public class CreateProductRequest
{
    public string SKU { get; set; } = null!;
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Description { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? UnitId { get; set; }
    public Guid? WarehouseId { get; set; }
    public Guid? BranchId { get; set; }
}

public class UpdateProductRequest : CreateProductRequest
{
    public Guid Id { get; set; }
}
