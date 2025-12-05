using System;
using System.Collections.Generic;

namespace ERP.Domain.Entities;

public enum PRStatus
{
    Draft = 0,
    Pending = 1,
    Approved = 2,
    Rejected = 3
}

public class PurchaseRequest
{
    public Guid Id { get; set; }
    public string Number { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public PRStatus Status { get; set; } = PRStatus.Draft;
    public string? Remarks { get; set; }
    public List<PurchaseRequestLine> Lines { get; set; } = new();
}
