using System;

namespace ERP.Domain.Entities;

public enum ArTransactionType
{
    Invoice = 0,
    Payment = 1,
    CreditNote = 2
}

public class ArTransaction
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public ArTransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public Guid? ReferenceId { get; set; }
    public string? Note { get; set; }
}
