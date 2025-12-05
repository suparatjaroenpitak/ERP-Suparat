using System;

namespace ERP.Application.DTOs;

public class ApprovalEvaluateDto
{
    public Guid? StepId { get; set; }
    public int? StepNumber { get; set; }
    public Guid? RoleId { get; set; }
    public string? RoleName { get; set; }
    public decimal MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
}

public class ApprovalActionDto
{
    public Guid ReferenceId { get; set; }
    public string Module { get; set; } = null!;
    public Guid? ApproverId { get; set; }
    public Guid? StepId { get; set; }
    public string Decision { get; set; } = "Approved"; // Approved, Rejected
    public string? Comment { get; set; }
    public decimal Amount { get; set; }
}
