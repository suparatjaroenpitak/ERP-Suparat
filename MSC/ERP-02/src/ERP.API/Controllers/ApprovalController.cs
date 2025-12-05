using Microsoft.AspNetCore.Mvc;
using ERP.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using ERP.Application.DTOs;
using ERP.Infrastructure.Data;
using ERP.Domain.Entities;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/approval")]
public class ApprovalController : ControllerBase
{
    private readonly IWorkflowEngine _engine;
    private readonly AppDbContext _db;
    public ApprovalController(IWorkflowEngine engine, AppDbContext db) { _engine = engine; _db = db; }

    [HttpGet("evaluate")]
    public async Task<IActionResult> Evaluate([FromQuery] string module, [FromQuery] decimal amount)
    {
        var step = await _engine.GetRequiredStepAsync(module, amount);
        if (step == null) return Ok(null);
        var dto = new ApprovalEvaluateDto
        {
            StepId = step.Id,
            StepNumber = step.StepNumber,
            RoleId = step.RoleId,
            RoleName = step.RoleName,
            MinAmount = step.MinAmount,
            MaxAmount = step.MaxAmount
        };
        return Ok(dto);
    }

    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] ApprovalActionDto dto)
    {
        if (dto == null) return BadRequest();

        // find flow for module
        var flow = await _db.ApprovalFlows.Include(f => f.Steps).Where(f => f.Module == dto.Module && f.IsActive).FirstOrDefaultAsync();
        if (flow == null) return BadRequest("Approval flow not found for module");

        var step = flow.Steps.FirstOrDefault(s => s.Id == dto.StepId) ?? (await _engine.GetRequiredStepAsync(dto.Module, dto.Amount));

        // check permission
        var can = false;
        if (dto.ApproverId.HasValue) can = await _engine.CanUserApproveAsync(dto.ApproverId.Value, dto.Module, dto.Amount);
        if (!can) return Forbid();

        var decision = dto.Decision.Equals("Approved", StringComparison.OrdinalIgnoreCase) ? ApprovalDecision.Approved : ApprovalDecision.Rejected;

        await _engine.RecordApprovalAsync(dto.ReferenceId, dto.Module, step?.Id, dto.ApproverId, decision, dto.Comment, dto.Amount, flow.Id);

        return Ok(new { ok = true });
    }
}
