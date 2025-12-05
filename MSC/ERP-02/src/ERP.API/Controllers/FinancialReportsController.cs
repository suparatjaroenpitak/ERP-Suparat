using Microsoft.AspNetCore.Mvc;
using ERP.Infrastructure.Data;
using ERP.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/report")]
public class FinancialReportsController : ControllerBase
{
    private readonly AppDbContext _db;
    public FinancialReportsController(AppDbContext db) => _db = db;

    [HttpGet("pl")]
    public async Task<IActionResult> ProfitAndLoss([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        var f = from ?? DateTime.UtcNow.Date.AddDays(-30);
        var t = to ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

        // get gl lines in range (join headers)
        var lines = await _db.GlTransactionLines
            .Include(l => l.GlTransactionHeader)
            .Include(l => l.Account)
            .Where(l => l.GlTransactionHeader.Date >= f && l.GlTransactionHeader.Date <= t)
            .ToListAsync();

        var revenues = lines.Where(l => l.Account.Type != null && l.Account.Type.Equals("Revenue", StringComparison.OrdinalIgnoreCase))
            .GroupBy(l => new { l.Account.Id, l.Account.Code, l.Account.Name })
            .Select(g => new PlLineDto { AccountCode = g.Key.Code, AccountName = g.Key.Name, Amount = g.Sum(x => x.Credit - x.Debit) })
            .OrderByDescending(x => x.Amount)
            .ToList();

        var expenses = lines.Where(l => l.Account.Type != null && l.Account.Type.Equals("Expense", StringComparison.OrdinalIgnoreCase))
            .GroupBy(l => new { l.Account.Id, l.Account.Code, l.Account.Name })
            .Select(g => new PlLineDto { AccountCode = g.Key.Code, AccountName = g.Key.Name, Amount = g.Sum(x => x.Debit - x.Credit) })
            .OrderByDescending(x => x.Amount)
            .ToList();

        var totalRev = revenues.Sum(r => r.Amount);
        var totalExp = expenses.Sum(e => e.Amount);

        var dto = new PlReportDto { From = f, To = t, Revenues = revenues, Expenses = expenses, TotalRevenue = totalRev, TotalExpense = totalExp };
        return Ok(dto);
    }

    [HttpGet("balance")]
    public async Task<IActionResult> BalanceSheet([FromQuery] DateTime? asOf = null)
    {
        var asOfDate = asOf ?? DateTime.UtcNow;

        // we need balances up to asOf: sum (debit - credit) for each account
        var lines = await _db.GlTransactionLines
            .Include(l => l.GlTransactionHeader)
            .Include(l => l.Account)
            .Where(l => l.GlTransactionHeader.Date <= asOfDate)
            .ToListAsync();

        var grouped = lines.GroupBy(l => new { l.Account.Id, l.Account.Code, l.Account.Name, Type = l.Account.Type })
            .Select(g => new { g.Key.Code, g.Key.Name, Type = g.Key.Type, Balance = g.Sum(x => x.Debit - x.Credit) })
            .ToList();

        var assets = grouped.Where(x => x.Type != null && x.Type.Equals("Asset", StringComparison.OrdinalIgnoreCase))
            .Select(x => new BalanceLineDto { AccountCode = x.Code, AccountName = x.Name, Amount = x.Balance }).ToList();
        var liabilities = grouped.Where(x => x.Type != null && x.Type.Equals("Liability", StringComparison.OrdinalIgnoreCase))
            .Select(x => new BalanceLineDto { AccountCode = x.Code, AccountName = x.Name, Amount = x.Balance }).ToList();
        var equity = grouped.Where(x => x.Type != null && (x.Type.Equals("Equity", StringComparison.OrdinalIgnoreCase) || x.Type.Equals("Capital", StringComparison.OrdinalIgnoreCase)))
            .Select(x => new BalanceLineDto { AccountCode = x.Code, AccountName = x.Name, Amount = x.Balance }).ToList();

        var dto = new BalanceSheetDto { AsOf = asOfDate, Assets = assets, Liabilities = liabilities, Equity = equity, TotalAssets = assets.Sum(a => a.Amount), TotalLiabilities = liabilities.Sum(l => l.Amount), TotalEquity = equity.Sum(e => e.Amount) };
        return Ok(dto);
    }

    [HttpGet("gp")]
    public async Task<IActionResult> GrossProfit([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        var f = from ?? DateTime.UtcNow.Date.AddDays(-30);
        var t = to ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

        // revenue from sales orders
        var sold = await _db.SalesOrderLines
            .Include(l => l.SalesOrder)
            .Where(l => l.SalesOrder.CreatedAt >= f && l.SalesOrder.CreatedAt <= t)
            .GroupBy(l => l.ProductId)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(x => x.Quantity), Revenue = g.Sum(x => x.UnitPrice * x.Quantity) })
            .ToListAsync();

        var productIds = sold.Select(s => s.ProductId).ToList();
        var products = await _db.Products.Where(p => productIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, p => p.Name);

        // estimate COGS using average unit cost from inventory transactions
        var costLookup = await _db.InventoryTransactionLines
            .Where(l => productIds.Contains(l.ProductId) && l.UnitCost > 0)
            .GroupBy(l => l.ProductId)
            .Select(g => new { ProductId = g.Key, AvgCost = g.Average(x => x.UnitCost) })
            .ToListAsync();

        var costByProduct = costLookup.ToDictionary(x => x.ProductId, x => x.AvgCost);

        var lines = new List<GpProductLineDto>();
        foreach (var s in sold)
        {
            var name = products.ContainsKey(s.ProductId) ? products[s.ProductId] : string.Empty;
            var avgCost = costByProduct.ContainsKey(s.ProductId) ? costByProduct[s.ProductId] : 0m;
            var cogs = avgCost * s.Quantity;
            lines.Add(new GpProductLineDto { ProductId = s.ProductId, ProductName = name, Revenue = s.Revenue, COGS = cogs });
        }

        var dto = new GpReportDto { From = f, To = t, Lines = lines.OrderByDescending(x => x.Revenue).ToList() };
        return Ok(dto);
    }

    [HttpGet("stock-movements")]
    public async Task<IActionResult> StockMovements([FromQuery] Guid? productId = null, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        var f = from ?? DateTime.UtcNow.Date.AddDays(-30);
        var t = to ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

        var q = _db.InventoryTransactionLines.Include(l => l.InventoryTransaction).Include(l => l.InventoryTransaction).AsQueryable();
        q = q.Where(l => l.InventoryTransaction.CreatedAt >= f && l.InventoryTransaction.CreatedAt <= t);
        if (productId.HasValue) q = q.Where(l => l.ProductId == productId.Value);

        var lines = await q.OrderByDescending(l => l.InventoryTransaction.CreatedAt)
            .Select(l => new StockMovementDto { ProductId = l.ProductId, ProductName = l.Product.Name, WarehouseId = l.InventoryTransaction.WarehouseFromId ?? l.InventoryTransaction.WarehouseToId, Date = l.InventoryTransaction.CreatedAt, Type = l.InventoryTransaction.Type.ToString(), Quantity = l.Quantity, UnitCost = l.UnitCost, Reference = l.InventoryTransaction.Reference })
            .ToListAsync();

        return Ok(lines);
    }

    [HttpGet("aging-ar")]
    public async Task<IActionResult> AgingAr([FromQuery] DateTime? asOf = null)
    {
        var asOfDate = asOf ?? DateTime.UtcNow.Date;

        // get transactions grouped by customer and bucket
        var txs = await _db.ArTransactions.Include(t => t.CustomerId).ToListAsync();

        var customers = await _db.Customers.ToDictionaryAsync(c => c.Id, c => c.Name);

        var byCustomer = txs.GroupBy(t => t.CustomerId).Select(g => new
        {
            CustomerId = g.Key,
            Transactions = g.Select(t => new { t.Date, t.Type, t.Amount }).ToList()
        }).ToList();

        var result = new List<AgingArCustomerDto>();
        foreach (var c in byCustomer)
        {
            var custName = customers.ContainsKey(c.CustomerId) ? customers[c.CustomerId] : null;
            var buckets = new List<AgingBucketDto>
            {
                new AgingBucketDto { Bucket = "0-30", Amount = 0 },
                new AgingBucketDto { Bucket = "31-60", Amount = 0 },
                new AgingBucketDto { Bucket = "61-90", Amount = 0 },
                new AgingBucketDto { Bucket = ">90", Amount = 0 }
            };

            decimal outstanding = 0m;
            foreach (var t in c.Transactions)
            {
                var age = (asOfDate - t.Date.Date).Days;
                var sign = t.Type == ArTransactionType.Payment ? -1 : 1; // payment reduces
                var amt = sign * t.Amount;
                outstanding += amt;

                if (age <= 30) buckets[0].Amount += amt;
                else if (age <= 60) buckets[1].Amount += amt;
                else if (age <= 90) buckets[2].Amount += amt;
                else buckets[3].Amount += amt;
            }

            result.Add(new AgingArCustomerDto { CustomerId = c.CustomerId, CustomerName = custName, Outstanding = outstanding, Buckets = buckets });
        }

        return Ok(result.OrderByDescending(r => r.Outstanding).ToList());
    }

    [HttpGet("product-sales-ranking")]
    public async Task<IActionResult> ProductSalesRanking([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null, [FromQuery] int top = 10)
    {
        var f = from ?? DateTime.UtcNow.Date.AddDays(-30);
        var t = to ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

        var q = _db.SalesOrderLines.Include(l => l.SalesOrder).Where(l => l.SalesOrder.CreatedAt >= f && l.SalesOrder.CreatedAt <= t);

        var ranking = await q.GroupBy(l => l.ProductId)
            .Select(g => new ProductSalesRankDto { ProductId = g.Key, Quantity = g.Sum(x => x.Quantity), Revenue = g.Sum(x => x.Quantity * x.UnitPrice) })
            .OrderByDescending(x => x.Revenue)
            .Take(top)
            .ToListAsync();

        var prodIds = ranking.Select(r => r.ProductId).ToList();
        var prodMap = await _db.Products.Where(p => prodIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, p => p.Name);

        foreach (var r in ranking) if (prodMap.ContainsKey(r.ProductId)) r.ProductName = prodMap[r.ProductId];

        return Ok(ranking);
    }
}
