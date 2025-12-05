using System;
using System.Collections.Generic;

namespace ERP.Application.DTOs;

public class PurchaseRequestLineCreateDto
{
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Note { get; set; }
}

public class PurchaseRequestCreateDto
{
    public string? Number { get; set; }
    public Guid? CreatedBy { get; set; }
    public string? Status { get; set; } = "Draft"; // Draft, Pending, Approved, Rejected
    public string? Remarks { get; set; }
    public List<PurchaseRequestLineCreateDto> Lines { get; set; } = new();
}

public class PurchaseRequestLineDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Note { get; set; }
}

public class PurchaseRequestDto
{
    public Guid Id { get; set; }
    public string Number { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = null!;
    public string? Remarks { get; set; }
    public List<PurchaseRequestLineDto> Lines { get; set; } = new();
}
