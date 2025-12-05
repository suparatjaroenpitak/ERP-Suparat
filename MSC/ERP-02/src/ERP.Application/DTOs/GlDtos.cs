using System;
using System.Collections.Generic;

namespace ERP.Application.DTOs;

public class AutoGlRequestDto
{
    public string Module { get; set; } = null!; // Invoice, PurchaseGR, POSSale
    public Guid? ReferenceId { get; set; }
    public Dictionary<string, decimal> Variables { get; set; } = new(); // e.g. { "Total": 1000, "Tax": 70, "Cost": 600 }
    public string? TemplateName { get; set; }
    public string? Description { get; set; }
}

public class GlPostResultDto
{
    public Guid TransactionId { get; set; }
    public string Number { get; set; } = null!;
}
