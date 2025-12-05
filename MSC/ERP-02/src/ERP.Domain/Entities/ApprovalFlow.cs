using System;
using System.Collections.Generic;

namespace ERP.Domain.Entities;

public class ApprovalFlow
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Module { get; set; } = null!; // e.g. Purchasing.PR
    public bool IsActive { get; set; } = true;
    public List<ApprovalStep> Steps { get; set; } = new();
}
