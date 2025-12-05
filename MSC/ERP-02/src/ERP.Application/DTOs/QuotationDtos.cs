using System;
using System.Collections.Generic;

namespace ERP.Application.DTOs;

public class QuotationLineCreateDto
{
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Note { get; set; }
}

public class QuotationCreateDto
{
    public string? Number { get; set; }
    public Guid? CreatedBy { get; set; }
    public string? Remarks { get; set; }
    public List<QuotationLineCreateDto> Lines { get; set; } = new();
}

public class QuotationLineDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Note { get; set; }
}

public class QuotationDto
{
    public Guid Id { get; set; }
    public string Number { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = null!;
    public string? Remarks { get; set; }
    public List<QuotationLineDto> Lines { get; set; } = new();
}

public class ConvertQuotationToOrderDto
{
    public Guid QuotationId { get; set; }
    public string? OrderNumber { get; set; }
    public Guid? CreatedBy { get; set; }
}
