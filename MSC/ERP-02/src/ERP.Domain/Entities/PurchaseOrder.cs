using System;
using System.Collections.Generic;

namespace ERP.Domain.Entities;

public enum POStatus
{
    Draft = 0,
    Open = 1,
    Complete = 2,
    Cancelled = 3
}

public class PurchaseOrder
{
    public Guid Id { get; set; }
    public string Number { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public POStatus Status { get; set; } = POStatus.Draft;
    public string? Remarks { get; set; }
    public List<PurchaseOrderLine> Lines { get; set; } = new();
}
