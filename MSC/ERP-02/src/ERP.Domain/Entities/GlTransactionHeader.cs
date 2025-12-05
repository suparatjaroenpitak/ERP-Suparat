using System;
using System.Collections.Generic;

namespace ERP.Domain.Entities;

public class GlTransactionHeader
{
    public Guid Id { get; set; }
    public string Number { get; set; } = null!;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Module { get; set; } = null!; // source module
    public Guid? ReferenceId { get; set; }
    public string? Description { get; set; }
    public List<GlTransactionLine> Lines { get; set; } = new();
}

public class GlTransactionLine
{
    public Guid Id { get; set; }
    public Guid GlTransactionHeaderId { get; set; }
    public GlTransactionHeader GlTransactionHeader { get; set; } = null!;
    public Guid AccountId { get; set; }
    public GlAccount Account { get; set; } = null!;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public string? Note { get; set; }
}
