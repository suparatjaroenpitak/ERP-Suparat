using ERP.Domain.Entities;

namespace ERP.Application.Interfaces;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id);
    Task<IEnumerable<Product>> GetPagedAsync(int page, int pageSize, string? search = null);
    Task AddAsync(Product product);
    Task UpdateAsync(Product product);
    Task DeleteAsync(Guid id);
}
