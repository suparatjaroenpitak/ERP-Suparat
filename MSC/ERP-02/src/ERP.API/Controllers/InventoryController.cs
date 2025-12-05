using Microsoft.AspNetCore.Mvc;
using ERP.Infrastructure.Data;
using ERP.Application.DTOs;
using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly AppDbContext _db;
    public InventoryController(AppDbContext db) => _db = db;

    [HttpPost("receive")]
    public async Task<IActionResult> Receive([FromBody] InventoryTransactionRequest req)
    {
        var tx = new InventoryTransaction { Id = Guid.NewGuid(), Type = InventoryTransactionType.Receive, Reference = req.Reference, WarehouseToId = req.WarehouseToId };
        foreach (var l in req.Lines)
        {
            tx.Lines.Add(new InventoryTransactionLine { Id = Guid.NewGuid(), ProductId = l.ProductId, Quantity = l.Quantity, UnitCost = l.UnitCost });
            await IncreaseStock(l.ProductId, req.WarehouseToId ?? Guid.Empty, l.Quantity);
        }
        _db.InventoryTransactions.Add(tx);
        await _db.SaveChangesAsync();
        return Ok(new { txId = tx.Id });
    }

    [HttpPost("issue")]
    public async Task<IActionResult> Issue([FromBody] InventoryTransactionRequest req)
    {
        if (!req.WarehouseFromId.HasValue) return BadRequest("warehouseFromId required");
        var tx = new InventoryTransaction { Id = Guid.NewGuid(), Type = InventoryTransactionType.Issue, Reference = req.Reference, WarehouseFromId = req.WarehouseFromId };
        foreach (var l in req.Lines)
        {
            // validate stock
            var can = await GetStock(l.ProductId, req.WarehouseFromId.Value);
            if (can < l.Quantity) return BadRequest($"Insufficient stock for product {l.ProductId}");
            tx.Lines.Add(new InventoryTransactionLine { Id = Guid.NewGuid(), ProductId = l.ProductId, Quantity = l.Quantity, UnitCost = l.UnitCost });
            await DecreaseStock(l.ProductId, req.WarehouseFromId.Value, l.Quantity);
        }
        _db.InventoryTransactions.Add(tx);
        await _db.SaveChangesAsync();
        return Ok(new { txId = tx.Id });
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> Transfer([FromBody] InventoryTransactionRequest req)
    {
        if (!req.WarehouseFromId.HasValue || !req.WarehouseToId.HasValue) return BadRequest("warehouseFromId and warehouseToId required");
        var tx = new InventoryTransaction { Id = Guid.NewGuid(), Type = InventoryTransactionType.Transfer, Reference = req.Reference, WarehouseFromId = req.WarehouseFromId, WarehouseToId = req.WarehouseToId };
        foreach (var l in req.Lines)
        {
            var can = await GetStock(l.ProductId, req.WarehouseFromId.Value);
            if (can < l.Quantity) return BadRequest($"Insufficient stock for product {l.ProductId}");
            tx.Lines.Add(new InventoryTransactionLine { Id = Guid.NewGuid(), ProductId = l.ProductId, Quantity = l.Quantity, UnitCost = l.UnitCost });
            await DecreaseStock(l.ProductId, req.WarehouseFromId.Value, l.Quantity);
            await IncreaseStock(l.ProductId, req.WarehouseToId.Value, l.Quantity);
        }
        _db.InventoryTransactions.Add(tx);
        await _db.SaveChangesAsync();
        return Ok(new { txId = tx.Id });
    }

    [HttpGet("stock")]
    public async Task<IActionResult> GetStock([FromQuery] Guid? productId = null, [FromQuery] Guid? warehouseId = null)
    {
        var q = _db.StockBalances.AsNoTracking().Include(s => s.Product).AsQueryable();
        if (productId.HasValue) q = q.Where(x => x.ProductId == productId.Value);
        if (warehouseId.HasValue) q = q.Where(x => x.WarehouseId == warehouseId.Value);
        var list = await q.Select(s => new StockBalanceDto { ProductId = s.ProductId, ProductName = s.Product.Name, WarehouseId = s.WarehouseId, Quantity = s.Quantity }).ToListAsync();
        return Ok(list);
    }

    [HttpGet("movements")]
    public async Task<IActionResult> Movements([FromQuery] Guid productId, [FromQuery] int days = 90)
    {
        var from = DateTime.UtcNow.Date.AddDays(-days + 1);
        var lines = await _db.InventoryTransactionLines
            .Where(l => l.ProductId == productId && l.InventoryTransaction.CreatedAt >= from)
            .Include(l => l.InventoryTransaction)
            .OrderByDescending(l => l.InventoryTransaction.CreatedAt)
            .Select(l => new { date = l.InventoryTransaction.CreatedAt, type = l.InventoryTransaction.Type, qty = l.Quantity, refId = l.InventoryTransactionId, ref = l.InventoryTransaction.Reference })
            .ToListAsync();
        return Ok(lines);
    }

    [HttpGet("alert")]
    public async Task<IActionResult> Alerts([FromQuery] Guid? productId = null, [FromQuery] Guid? warehouseId = null)
    {
        // get relevant minstock entries
        var q = _db.MinStocks.Include(m => m.Product).AsQueryable();
        if (productId.HasValue) q = q.Where(m => m.ProductId == productId.Value);
        if (warehouseId.HasValue) q = q.Where(m => m.WarehouseId == warehouseId.Value || m.WarehouseId == null);

        var minStocks = await q.ToListAsync();
        if (!minStocks.Any()) return Ok(new List<InventoryAlertDto>());

        var productIds = minStocks.Select(m => m.ProductId).Distinct().ToList();
        var stocks = await _db.StockBalances.Where(s => productIds.Contains(s.ProductId)).ToListAsync();

        // prepare lookups
        var stockByProductWarehouse = stocks.ToDictionary(s => (s.ProductId, s.WarehouseId), s => s.Quantity);
        var stockByProductSum = stocks.GroupBy(s => s.ProductId).ToDictionary(g => g.Key, g => g.Sum(x => x.Quantity));

        var alerts = new List<InventoryAlertDto>();
        foreach (var m in minStocks)
        {
            decimal qty;
            if (m.WarehouseId == null)
            {
                stockByProductSum.TryGetValue(m.ProductId, out qty);
            }
            else
            {
                stockByProductWarehouse.TryGetValue((m.ProductId, m.WarehouseId), out qty);
            }

            if (qty < m.MinQuantity)
            {
                alerts.Add(new InventoryAlertDto
                {
                    ProductId = m.ProductId,
                    ProductName = m.Product?.Name ?? string.Empty,
                    WarehouseId = m.WarehouseId,
                    Quantity = qty,
                    MinQuantity = m.MinQuantity
                });
            }
        }

        return Ok(alerts);
    }

    private async Task<decimal> GetStock(Guid productId, Guid warehouseId)
    {
        if (warehouseId == Guid.Empty) return 0;
        var sb = await _db.StockBalances.FirstOrDefaultAsync(s => s.ProductId == productId && s.WarehouseId == warehouseId);
        return sb?.Quantity ?? 0m;
    }

    private async Task IncreaseStock(Guid productId, Guid warehouseId, decimal qty)
    {
        if (warehouseId == Guid.Empty) return;
        var sb = await _db.StockBalances.FirstOrDefaultAsync(s => s.ProductId == productId && s.WarehouseId == warehouseId);
        if (sb == null)
        {
            sb = new StockBalance { Id = Guid.NewGuid(), ProductId = productId, WarehouseId = warehouseId, Quantity = qty, UpdatedAt = DateTime.UtcNow };
            _db.StockBalances.Add(sb);
        }
        else
        {
            sb.Quantity += qty;
            sb.UpdatedAt = DateTime.UtcNow;
            _db.StockBalances.Update(sb);
        }
    }

    private async Task DecreaseStock(Guid productId, Guid warehouseId, decimal qty)
    {
        if (warehouseId == Guid.Empty) return;
        var sb = await _db.StockBalances.FirstOrDefaultAsync(s => s.ProductId == productId && s.WarehouseId == warehouseId);
        if (sb == null) throw new InvalidOperationException("Stock balance missing");
        sb.Quantity -= qty;
        sb.UpdatedAt = DateTime.UtcNow;
        _db.StockBalances.Update(sb);
    }
}
