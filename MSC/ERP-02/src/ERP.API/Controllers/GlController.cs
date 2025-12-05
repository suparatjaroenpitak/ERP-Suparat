using Microsoft.AspNetCore.Mvc;
using ERP.Infrastructure.Data;
using ERP.Application.DTOs;
using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/gl")]
public class GlController : ControllerBase
{
    private readonly AppDbContext _db;
    public GlController(AppDbContext db) => _db = db;

    [HttpPost("auto")]
    public async Task<IActionResult> AutoPost([FromBody] AutoGlRequestDto dto)
    {
        if (dto == null) return BadRequest("Invalid payload");

        // find template
        var q = _db.GlTemplates.Include(t => t.Lines).AsQueryable();
        q = q.Where(t => t.Module == dto.Module);
        if (!string.IsNullOrWhiteSpace(dto.TemplateName)) q = q.Where(t => t.Name == dto.TemplateName);
        var template = await q.FirstOrDefaultAsync();
        if (template == null) return BadRequest("GL template not found for module");

        // prepare variables for formula evaluation
        var vars = dto.Variables ?? new Dictionary<string, decimal>();

        // evaluate amounts and build lines
        var header = new GlTransactionHeader { Id = Guid.NewGuid(), Number = $"GL-{DateTime.UtcNow:yyyyMMddHHmmss}", Date = DateTime.UtcNow, Module = dto.Module, ReferenceId = dto.ReferenceId, Description = dto.Description };

        foreach (var line in template.Lines.OrderBy(l => l.LineOrder))
        {
            // find account by code
            var account = await _db.GlAccounts.FirstOrDefaultAsync(a => a.Code == line.AccountCode);
            if (account == null) return BadRequest($"GL Account not found: {line.AccountCode}");

            decimal amount = 0m;
            try
            {
                amount = EvaluateFormula(line.AmountFormula, vars);
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to evaluate formula '{line.AmountFormula}': {ex.Message}");
            }

            if (amount == 0m) continue; // skip zero lines

            var glLine = new GlTransactionLine { Id = Guid.NewGuid(), AccountId = account.Id, Debit = line.IsDebit ? amount : 0m, Credit = line.IsDebit ? 0m : amount, Note = template.Name };
            header.Lines.Add(glLine);
        }

        // simple validation: total debits == total credits
        var totalDebit = header.Lines.Sum(l => l.Debit);
        var totalCredit = header.Lines.Sum(l => l.Credit);
        if (totalDebit != totalCredit)
        {
            return BadRequest($"Unbalanced journal: debit={totalDebit} credit={totalCredit}");
        }

        _db.GlTransactionHeaders.Add(header);
        await _db.SaveChangesAsync();

        return Ok(new GlPostResultDto { TransactionId = header.Id, Number = header.Number });
    }

    private decimal EvaluateFormula(string formula, Dictionary<string, decimal> vars)
    {
        // Replace variable tokens with numeric literals
        var expr = formula;
        foreach (var kv in vars)
        {
            expr = expr.Replace(kv.Key, kv.Value.ToString(System.Globalization.CultureInfo.InvariantCulture));
        }

        // Basic support: allow numbers and + - * / and parenthesis.
        // Use DataTable.Compute as a quick evaluator (note: limited and not sandboxed for complex input)
        var table = new DataTable();
        var value = table.Compute(expr, null);
        return Convert.ToDecimal(value);
    }
}
