using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ERP.Application.Interfaces;
using ERP.Infrastructure.Data;
using ERP.Domain.Entities;

namespace ERP.Application.Services;

public class WorkflowEngine : IWorkflowEngine
{
    private readonly AppDbContext _db;
    public WorkflowEngine(AppDbContext db) => _db = db;

    public async Task<ApprovalStep?> GetRequiredStepAsync(string module, decimal amount)
    {
        var flow = await _db.ApprovalFlows.Include(f => f.Steps).Where(f => f.Module == module && f.IsActive).OrderBy(f => f.Name).FirstOrDefaultAsync();
        if (flow == null) return null;

        var step = flow.Steps.OrderBy(s => s.StepNumber)
            .FirstOrDefault(s => amount >= s.MinAmount && (s.MaxAmount == null || amount <= s.MaxAmount.Value));

        return step;
    }

    public async Task<bool> CanUserApproveAsync(Guid userId, string module, decimal amount)
    {
        var step = await GetRequiredStepAsync(module, amount);
        if (step == null) return false;

        // check role membership
        if (step.RoleId.HasValue)
        {
            var exists = await _db.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == step.RoleId.Value);
            if (exists) return true;
        }

        if (!string.IsNullOrWhiteSpace(step.RoleName))
        {
            var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == step.RoleName);
            if (role != null)
            {
                var exists = await _db.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == role.Id);
                if (exists) return true;
            }
        }

        return false;
    }

    public async Task RecordApprovalAsync(Guid referenceId, string module, Guid? stepId, Guid? approverId, ApprovalDecision decision, string? comment, decimal amount, Guid flowId)
    {
        var hist = new ApprovalHistory
        {
            Id = Guid.NewGuid(),
            ApprovalFlowId = flowId,
            ApprovalStepId = stepId,
            ReferenceId = referenceId,
            Module = module,
            ApproverId = approverId,
            Decision = decision,
            Comment = comment,
            Amount = amount,
            CreatedAt = DateTime.UtcNow
        };

        _db.ApprovalHistories.Add(hist);
        await _db.SaveChangesAsync();
    }
}
