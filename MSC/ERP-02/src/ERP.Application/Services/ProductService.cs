using AutoMapper;
using ERP.Application.DTOs;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;
    private readonly IMapper _mapper;
    public ProductService(IProductRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<Guid> CreateAsync(CreateProductRequest request)
    {
        var entity = new Product
        {
            Id = Guid.NewGuid(),
            SKU = request.SKU.ToUpperInvariant(),
            Name = request.Name.Trim(),
            Price = request.Price
            ,
            Description = request.Description,
            CategoryId = request.CategoryId,
            UnitId = request.UnitId,
            WarehouseId = request.WarehouseId,
            BranchId = request.BranchId,
            IsActive = request.IsActive
        };
        await _repo.AddAsync(entity);
        return entity.Id;
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e is null) return null;
        return _mapper.Map<ProductDto>(e);
    }

    public async Task<IEnumerable<ProductDto>> GetPagedAsync(int page, int pageSize, string? search = null)
    {
        var list = await _repo.GetPagedAsync(page, pageSize, search);
        return _mapper.Map<IEnumerable<ProductDto>>(list);
    }

    public async Task UpdateAsync(UpdateProductRequest request)
    {
        var existing = await _repo.GetByIdAsync(request.Id);
        if (existing == null) throw new KeyNotFoundException("Product not found");
        existing.SKU = request.SKU.ToUpperInvariant();
        existing.Name = request.Name.Trim();
        existing.Price = request.Price;
        existing.Description = request.Description;
        existing.CategoryId = request.CategoryId;
        existing.UnitId = request.UnitId;
        existing.WarehouseId = request.WarehouseId;
        existing.BranchId = request.BranchId;
        existing.IsActive = request.IsActive;
        await _repo.UpdateAsync(existing);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _repo.DeleteAsync(id);
    }
}
