using Microsoft.AspNetCore.Mvc;
using ERP.Infrastructure.Data;
using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _db;
    public CustomersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? q)
    {
        var qq = _db.Customers.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(q)) qq = qq.Where(c => c.Name.Contains(q) || (c.Phone ?? "").Contains(q));
        var list = await qq.OrderBy(c => c.Name).Take(20).Select(c => new { c.Id, c.Name, c.Phone, c.PointsBalance }).ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Customer model)
    {
        model.Id = Guid.NewGuid();
        _db.Customers.Add(model);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var c = await _db.Customers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (c == null) return NotFound();
        return Ok(c);
    }
}
