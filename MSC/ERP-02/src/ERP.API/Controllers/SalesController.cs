using Microsoft.AspNetCore.Mvc;
using ERP.Infrastructure.Data;
using ERP.Application.DTOs;
using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/sales")]
public class SalesController : ControllerBase
{
    private readonly AppDbContext _db;
    public SalesController(AppDbContext db) => _db = db;

    [HttpPost("quotation/create")]
    public async Task<IActionResult> CreateQuotation([FromBody] QuotationCreateDto dto)
    {
        if (dto == null) return BadRequest("Invalid payload");

        var q = new Quotation
        {
            Id = Guid.NewGuid(),
            Number = string.IsNullOrWhiteSpace(dto.Number) ? $"QT-{DateTime.UtcNow:yyyyMMddHHmmss}" : dto.Number!,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = dto.CreatedBy,
            Status = QuotationStatus.Draft,
            Remarks = dto.Remarks
        };

        foreach (var l in dto.Lines ?? new List<QuotationLineCreateDto>())
        {
            q.Lines.Add(new QuotationLine { Id = Guid.NewGuid(), ProductId = l.ProductId, Quantity = l.Quantity, UnitPrice = l.UnitPrice, Note = l.Note });
        }

        _db.Quotations.Add(q);
        await _db.SaveChangesAsync();

        var res = new QuotationDto { Id = q.Id, Number = q.Number, CreatedAt = q.CreatedAt, Status = q.Status.ToString(), Remarks = q.Remarks, Lines = q.Lines.Select(x => new QuotationLineDto { Id = x.Id, ProductId = x.ProductId, Quantity = x.Quantity, UnitPrice = x.UnitPrice, Note = x.Note }).ToList() };
        return Ok(res);
    }

    [HttpPost("quotation/convert")]
    public async Task<IActionResult> ConvertQuotation([FromBody] ConvertQuotationToOrderDto dto)
    {
        if (dto == null) return BadRequest("Invalid payload");

        var q = await _db.Quotations.Include(x => x.Lines).FirstOrDefaultAsync(x => x.Id == dto.QuotationId);
        if (q == null) return NotFound("Quotation not found");

        if (q.Status == QuotationStatus.Converted) return BadRequest("Quotation already converted");

        var so = new SalesOrder
        {
            Id = Guid.NewGuid(),
            Number = string.IsNullOrWhiteSpace(dto.OrderNumber) ? $"SO-{DateTime.UtcNow:yyyyMMddHHmmss}" : dto.OrderNumber!,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = dto.CreatedBy,
            Status = SalesOrderStatus.Open,
            Remarks = q.Remarks
        };

        foreach (var l in q.Lines)
        {
            so.Lines.Add(new SalesOrderLine { Id = Guid.NewGuid(), ProductId = l.ProductId, Quantity = l.Quantity, ShippedQuantity = 0m, UnitPrice = l.UnitPrice, Note = l.Note });
        }

        // persist SO and mark quotation converted
        _db.SalesOrders.Add(so);
        q.Status = QuotationStatus.Converted;
        _db.Quotations.Update(q);

        await _db.SaveChangesAsync();

        var result = new PurchaseOrderDto(); // reuse shape? create SalesOrderDto quickly
        var soDto = new
        {
            Id = so.Id,
            Number = so.Number,
            CreatedAt = so.CreatedAt,
            Status = so.Status.ToString(),
            Remarks = so.Remarks,
            Lines = so.Lines.Select(x => new { x.Id, x.ProductId, x.Quantity, x.UnitPrice, x.ShippedQuantity, x.Note }).ToList()
        };

        return Ok(soDto);
    }
}
