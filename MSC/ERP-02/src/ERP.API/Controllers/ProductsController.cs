using Microsoft.AspNetCore.Mvc;
using ERP.Application.Interfaces;
using ERP.Application.DTOs;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _svc;
    public ProductsController(IProductService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        var items = await _svc.GetPagedAsync(page, pageSize, search);
        return Ok(new { success = true, data = items });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var item = await _svc.GetByIdAsync(id);
        if (item == null) return NotFound(new { success = false, errors = new[] { "Not found" } });
        return Ok(new { success = true, data = item });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest req)
    {
        var id = await _svc.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id }, new { success = true, data = new { id } });
    }
}
