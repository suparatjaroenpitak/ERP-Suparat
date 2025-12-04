using ERP.Application.DTOs;

namespace ERP.Application.Interfaces;

public interface IProductService
{
    Task<ProductDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<ProductDto>> GetPagedAsync(int page, int pageSize, string? search = null);
    Task<Guid> CreateAsync(CreateProductRequest request);
}
