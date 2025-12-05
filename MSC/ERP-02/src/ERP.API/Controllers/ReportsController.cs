using Microsoft.AspNetCore.Mvc;
using ERP.Infrastructure.Data;
using ERP.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/report")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReportsController(AppDbContext db) => _db = db;

    [HttpGet("sales/daily")]
    public async Task<IActionResult> DailySales([FromQuery] int days = 30, [FromQuery] int top = 5)
    {
        if (days <= 0) days = 30;
        var from = DateTime.UtcNow.Date.AddDays(-days + 1);

        // consider completed orders only
        var orders = _db.Orders
            .Where(o => o.Status == Domain.Entities.OrderStatus.Completed && o.CreatedAt >= from);

        // daily totals
        var dailyQuery = await orders
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new
            {
                Date = g.Key,
                Total = g.Sum(o => (o.TotalAmount - o.TotalDiscount))
            })
            .OrderBy(x => x.Date)
            .ToListAsync();

        var dailyDict = dailyQuery.ToDictionary(x => x.Date.Date, x => x.Total);

        var daily = new List<DailySalesPoint>();
        for (var d = from.Date; d <= DateTime.UtcNow.Date; d = d.AddDays(1))
        {
            daily.Add(new DailySalesPoint { Date = d.ToString("yyyy-MM-dd"), Total = dailyDict.ContainsKey(d) ? dailyDict[d] : 0m });
        }

        // top products by revenue
        var topProductsQuery = await _db.OrderItems
            .Where(oi => oi.Order.Status == Domain.Entities.OrderStatus.Completed && oi.Order.CreatedAt >= from)
            .GroupBy(oi => new { oi.ProductId, oi.Product.Name })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                Quantity = g.Sum(x => x.Quantity),
                Revenue = g.Sum(x => x.UnitPrice * x.Quantity - x.DiscountAmount)
            })
            .OrderByDescending(x => x.Revenue)
            .Take(top)
            .ToListAsync();

        var totalSales = daily.Sum(d => d.Total);

        var resp = new SalesReportDto
        {
            TotalSales = totalSales,
            Daily = daily,
            TopProducts = topProductsQuery
        };

        return Ok(resp);
    }
}
