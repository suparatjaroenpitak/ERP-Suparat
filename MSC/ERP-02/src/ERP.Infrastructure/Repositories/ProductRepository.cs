using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using ERP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERP.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _db;
    public ProductRepository(AppDbContext db) => _db = db;

    public async Task AddAsync(Product product)
    {
        await _db.Products.AddAsync(product);
        await _db.SaveChangesAsync();
    }






















}    }        await _db.SaveChangesAsync();        _db.Products.Update(product);    {
n    public async Task UpdateAsync(Product product)    }        return await q.OrderBy(x => x.Name).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(x => x.Name.Contains(search) || x.SKU.Contains(search));        var q = _db.Products.AsNoTracking().AsQueryable();    {
n    public async Task<IEnumerable<Product>> GetPagedAsync(int page, int pageSize, string? search = null)        => await _db.Products.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
n    public async Task<Product?> GetByIdAsync(Guid id)    }        await _db.SaveChangesAsync();        _db.Products.Remove(e);        if (e == null) return;        var e = await _db.Products.FindAsync(id);    {n    public async Task DeleteAsync(Guid id)