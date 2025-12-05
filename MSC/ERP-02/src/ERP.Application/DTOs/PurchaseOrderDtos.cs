using System;
using System.Collections.Generic;

namespace ERP.Application.DTOs;

public class PurchaseOrderLineCreateDto
{
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Note { get; set; }
}

public class PurchaseOrderCreateDto
{
    public string? Number { get; set; }
    public Guid? CreatedBy { get; set; }
    public string? Remarks { get; set; }
    public List<PurchaseOrderLineCreateDto> Lines { get; set; } = new();
}

public class PurchaseOrderLineDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Note { get; set; }
}

public class PurchaseOrderDto
{
    public Guid Id { get; set; }
    public string Number { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = null!;
    public string? Remarks { get; set; }
    public List<PurchaseOrderLineDto> Lines { get; set; } = new();
}
