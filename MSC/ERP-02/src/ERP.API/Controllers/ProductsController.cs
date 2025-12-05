using Microsoft.AspNetCore.Mvc;
using ERP.Application.Interfaces;
using ERP.Application.DTOs;
using ERP.Domain.Entities;
using ERP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public ProductsController(IProductService service, AppDbContext db, IWebHostEnvironment env)
    {
        _service = service;
        _db = db;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        var list = await _service.GetPagedAsync(page, pageSize, search);
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var p = await _service.GetByIdAsync(id);
        if (p == null) return NotFound();
        return Ok(p);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest req)
    {
        var id = await _service.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest req)
    {
        if (id != req.Id) return BadRequest();
        await _service.UpdateAsync(req);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/upload")]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile file)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null) return NotFound();

        if (file == null || file.Length == 0) return BadRequest("No file uploaded");

        var uploads = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"prod_{id}{ext}";
        var filePath = Path.Combine(uploads, fileName);

        using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        var relative = $"/uploads/{fileName}";
        product.ImageUrl = relative;
        await _db.SaveChangesAsync();

        return Ok(new { url = relative });
    }
}
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
