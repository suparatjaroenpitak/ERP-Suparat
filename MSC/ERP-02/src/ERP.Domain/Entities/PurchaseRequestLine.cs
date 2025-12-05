using System;

namespace ERP.Domain.Entities;

public class PurchaseRequestLine
{
    public Guid Id { get; set; }
    public Guid PurchaseRequestId { get; set; }
    public PurchaseRequest PurchaseRequest { get; set; } = null!;
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Note { get; set; }
}
