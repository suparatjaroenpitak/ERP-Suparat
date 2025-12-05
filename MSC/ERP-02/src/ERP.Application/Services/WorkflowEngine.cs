using System;
using System.Threading.Tasks;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Application.Services;

// Lightweight placeholder implementation so Application builds without depending on Infrastructure.
// Replace with a true implementation in Infrastructure that uses AppDbContext when you are ready.
public class WorkflowEngine : IWorkflowEngine
{
    public Task<ApprovalStep?> GetRequiredStepAsync(string module, decimal amount)
    {
        // No workflow configured in this placeholder.
        return Task.FromResult<ApprovalStep?>(null);
    }

    public Task<bool> CanUserApproveAsync(Guid userId, string module, decimal amount)
    {
        return Task.FromResult(false);
    }

    public Task RecordApprovalAsync(Guid referenceId, string module, Guid? stepId, Guid? approverId, ApprovalDecision decision, string? comment, decimal amount, Guid flowId)
    {
        // no-op placeholder
        return Task.CompletedTask;
    }
}
