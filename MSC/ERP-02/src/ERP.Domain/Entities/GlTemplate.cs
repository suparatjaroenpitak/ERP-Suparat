using System;
using System.Collections.Generic;

namespace ERP.Domain.Entities;

public class GlTemplate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Module { get; set; } = null!; // e.g. Invoice, PurchaseGR, POSSale
    public string? Description { get; set; }
    public List<GlTemplateLine> Lines { get; set; } = new();
}

public class GlTemplateLine
{
    public Guid Id { get; set; }
    public Guid GlTemplateId { get; set; }
    public GlTemplate GlTemplate { get; set; } = null!;
    public string AccountCode { get; set; } = null!; // match GlAccount.Code
    public bool IsDebit { get; set; }
    public string AmountFormula { get; set; } = "Total"; // simple formula: Total, Tax, Cost, or arithmetic expression
    public int LineOrder { get; set; }
}
