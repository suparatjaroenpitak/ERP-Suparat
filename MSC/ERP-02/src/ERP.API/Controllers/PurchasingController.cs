using Microsoft.AspNetCore.Mvc;
using ERP.Infrastructure.Data;
using ERP.Application.DTOs;
using ERP.Domain.Entities;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/purchasing")]
public class PurchasingController : ControllerBase
{
    private readonly AppDbContext _db;
    public PurchasingController(AppDbContext db) => _db = db;

    [HttpPost("pr/create")]
    public async Task<IActionResult> CreatePR([FromBody] PurchaseRequestCreateDto dto)
    {
        if (dto == null) return BadRequest("Invalid payload");

        // parse status
        PRStatus status = PRStatus.Draft;
        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            if (!Enum.TryParse<PRStatus>(dto.Status, true, out status))
            {
                return BadRequest("Invalid status");
            }
        }

        var pr = new PurchaseRequest
        {
            Id = Guid.NewGuid(),
            Number = string.IsNullOrWhiteSpace(dto.Number) ? $"PR-{DateTime.UtcNow:yyyyMMddHHmmss}" : dto.Number!,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = dto.CreatedBy,
            Status = status,
            Remarks = dto.Remarks
        };

        foreach (var l in dto.Lines ?? new List<PurchaseRequestLineCreateDto>())
        {
            pr.Lines.Add(new PurchaseRequestLine
            {
                Id = Guid.NewGuid(),
                ProductId = l.ProductId,
                Quantity = l.Quantity,
                UnitPrice = l.UnitPrice,
                Note = l.Note
            });
        }

        _db.PurchaseRequests.Add(pr);
        await _db.SaveChangesAsync();

        var result = new PurchaseRequestDto
        {
            Id = pr.Id,
            Number = pr.Number,
            CreatedAt = pr.CreatedAt,
            Status = pr.Status.ToString(),
            Remarks = pr.Remarks,
            Lines = pr.Lines.Select(x => new PurchaseRequestLineDto { Id = x.Id, ProductId = x.ProductId, Quantity = x.Quantity, UnitPrice = x.UnitPrice, Note = x.Note }).ToList()
        };

        return Ok(result);
    }

    [HttpPost("po/create")]
    public async Task<IActionResult> CreatePO([FromBody] PurchaseOrderCreateDto dto)
    {
        if (dto == null) return BadRequest("Invalid payload");

        var po = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            Number = string.IsNullOrWhiteSpace(dto.Number) ? $"PO-{DateTime.UtcNow:yyyyMMddHHmmss}" : dto.Number!,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = dto.CreatedBy,
            Status = POStatus.Open,
            Remarks = dto.Remarks
        };

        foreach (var l in dto.Lines ?? new List<PurchaseOrderLineCreateDto>())
        {
            po.Lines.Add(new PurchaseOrderLine
            {
                Id = Guid.NewGuid(),
                ProductId = l.ProductId,
                Quantity = l.Quantity,
                ReceivedQuantity = 0m,
                UnitPrice = l.UnitPrice,
                Note = l.Note
            });
        }

        _db.PurchaseOrders.Add(po);
        await _db.SaveChangesAsync();

        var result = new PurchaseOrderDto
        {
            Id = po.Id,
            Number = po.Number,
            CreatedAt = po.CreatedAt,
            Status = po.Status.ToString(),
            Remarks = po.Remarks,
            Lines = po.Lines.Select(x => new PurchaseOrderLineDto { Id = x.Id, ProductId = x.ProductId, Quantity = x.Quantity, ReceivedQuantity = x.ReceivedQuantity, UnitPrice = x.UnitPrice, Note = x.Note }).ToList()
        };

        return Ok(result);
    }

    [HttpPost("gr/create")]
    public async Task<IActionResult> CreateGR([FromBody] GoodsReceiptCreateDto dto)
    {
        if (dto == null) return BadRequest("Invalid payload");
        // find PO
        var po = await _db.PurchaseOrders.Include(p => p.Lines).FirstOrDefaultAsync(p => p.Id == dto.PurchaseOrderId);
        if (po == null) return BadRequest("Purchase order not found");

        // create inventory transaction (Issue) to deduct stock
        var tx = new InventoryTransaction { Id = Guid.NewGuid(), Type = InventoryTransactionType.Issue, Reference = dto.Reference ?? $"GR-{DateTime.UtcNow:yyyyMMddHHmmss}", WarehouseFromId = dto.WarehouseId };

        foreach (var l in dto.Lines ?? new List<GoodsReceiptLineCreateDto>())
        {
            var poLine = po.Lines.FirstOrDefault(x => x.ProductId == l.ProductId);
            if (poLine == null) return BadRequest($"Product {l.ProductId} not found in PO");

            // update received qty
            poLine.ReceivedQuantity += l.Quantity;

            // decrease stock from warehouse
            var sb = await _db.StockBalances.FirstOrDefaultAsync(s => s.ProductId == l.ProductId && s.WarehouseId == dto.WarehouseId);
            if (sb == null || sb.Quantity < l.Quantity) return BadRequest($"Insufficient stock for product {l.ProductId} in warehouse {dto.WarehouseId}");
            sb.Quantity -= l.Quantity;
            sb.UpdatedAt = DateTime.UtcNow;
            _db.StockBalances.Update(sb);

            tx.Lines.Add(new InventoryTransactionLine { Id = Guid.NewGuid(), ProductId = l.ProductId, Quantity = l.Quantity, UnitCost = l.UnitCost });
        }

        _db.InventoryTransactions.Add(tx);

        // check if all lines fully received
        if (po.Lines.All(x => x.ReceivedQuantity >= x.Quantity))
        {
            po.Status = POStatus.Complete;
        }

        await _db.SaveChangesAsync();

        return Ok(new { ok = true, poId = po.Id, status = po.Status.ToString() });
    }
}
