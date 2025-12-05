using System;

namespace ERP.Domain.Entities;

public class GlAccount
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Type { get; set; } // Asset, Liability, Equity, Revenue, Expense
}
