using Microsoft.AspNetCore.Mvc;
using ERP.Infrastructure.Data;
using ERP.Application.DTOs;
using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/ar")]
public class ArController : ControllerBase
{
    private readonly AppDbContext _db;
    public ArController(AppDbContext db) => _db = db;

    [HttpGet("customer/{customerId}/summary")]
    public async Task<IActionResult> CustomerSummary([FromRoute] Guid customerId)
    {
        var credit = await _db.CustomerCredits.AsNoTracking().FirstOrDefaultAsync(c => c.CustomerId == customerId);
        var outstanding = await _db.ArTransactions.Where(t => t.CustomerId == customerId)
            .SumAsync(t => t.Type == ArTransactionType.Payment ? -t.Amount : t.Amount);

        var creditLimit = credit?.CreditLimit ?? 0m;
        var available = creditLimit - outstanding;

        var dto = new CustomerArSummaryDto { CustomerId = customerId, Outstanding = outstanding, CreditLimit = creditLimit, AvailableCredit = available };
        return Ok(dto);
    }

    [HttpGet("customer/{customerId}/transactions")]
    public async Task<IActionResult> Transactions([FromRoute] Guid customerId, [FromQuery] int take = 50)
    {
        var list = await _db.ArTransactions.Where(t => t.CustomerId == customerId).OrderByDescending(t => t.Date).Take(take)
            .Select(t => new ArTransactionDto { Id = t.Id, Date = t.Date, Type = t.Type.ToString(), Amount = t.Amount, Note = t.Note })
            .ToListAsync();
        return Ok(list);
    }
}
