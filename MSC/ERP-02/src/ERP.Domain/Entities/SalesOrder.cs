using System;
using System.Collections.Generic;

namespace ERP.Domain.Entities;

public enum SalesOrderStatus
{
    Draft = 0,
    Open = 1,
    Complete = 2,
    Cancelled = 3
}

public class SalesOrder
{
    public Guid Id { get; set; }
    public string Number { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public SalesOrderStatus Status { get; set; } = SalesOrderStatus.Draft;
    public string? Remarks { get; set; }
    public List<SalesOrderLine> Lines { get; set; } = new();
}

public class SalesOrderLine
{
    public Guid Id { get; set; }
    public Guid SalesOrderId { get; set; }
    public SalesOrder SalesOrder { get; set; } = null!;
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal ShippedQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Note { get; set; }
}
