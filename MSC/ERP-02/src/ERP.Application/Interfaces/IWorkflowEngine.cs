using System;
using System.Threading.Tasks;

namespace ERP.Application.Interfaces;

public interface IWorkflowEngine
{
    Task<ERP.Domain.Entities.ApprovalStep?> GetRequiredStepAsync(string module, decimal amount);
    Task<bool> CanUserApproveAsync(Guid userId, string module, decimal amount);
    Task RecordApprovalAsync(Guid referenceId, string module, Guid? stepId, Guid? approverId, ERP.Domain.Entities.ApprovalDecision decision, string? comment, decimal amount, Guid flowId);
}
