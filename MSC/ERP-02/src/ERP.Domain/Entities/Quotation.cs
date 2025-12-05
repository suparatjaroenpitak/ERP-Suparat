using System;
using System.Collections.Generic;

namespace ERP.Domain.Entities;

public enum QuotationStatus
{
    Draft = 0,
    Sent = 1,
    Converted = 2,
    Cancelled = 3
}

public class Quotation
{
    public Guid Id { get; set; }
    public string Number { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public QuotationStatus Status { get; set; } = QuotationStatus.Draft;
    public string? Remarks { get; set; }
    public List<QuotationLine> Lines { get; set; } = new();
}

public class QuotationLine
{
    public Guid Id { get; set; }
    public Guid QuotationId { get; set; }
    public Quotation Quotation { get; set; } = null!;
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Note { get; set; }
}
