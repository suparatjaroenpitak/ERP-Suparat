using System;

namespace ERP.Domain.Entities;

public enum ApprovalDecision
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

public class ApprovalHistory
{
    public Guid Id { get; set; }
    public Guid ApprovalFlowId { get; set; }
    public ApprovalFlow ApprovalFlow { get; set; } = null!;
    public Guid? ApprovalStepId { get; set; }
    public ApprovalStep? ApprovalStep { get; set; }
    public Guid ReferenceId { get; set; } // e.g. PurchaseRequest Id
    public string Module { get; set; } = null!;
    public Guid? ApproverId { get; set; }
    public ApprovalDecision Decision { get; set; } = ApprovalDecision.Pending;
    public string? Comment { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
