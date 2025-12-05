using System;

namespace ERP.Domain.Entities;

public class ApprovalStep
{
    public Guid Id { get; set; }
    public Guid ApprovalFlowId { get; set; }
    public ApprovalFlow ApprovalFlow { get; set; } = null!;
    public int StepNumber { get; set; }
    public Guid? RoleId { get; set; } // optional link to Role
    public string? RoleName { get; set; } // fallback by name
    public decimal MinAmount { get; set; } = 0m;
    public decimal? MaxAmount { get; set; } // null = no upper limit
}
