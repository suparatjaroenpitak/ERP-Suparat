using System;
using System.Collections.Generic;

namespace ERP.Application.DTOs;

public class CustomerArSummaryDto
{
    public Guid CustomerId { get; set; }
    public decimal Outstanding { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal AvailableCredit { get; set; }
}

public class ArTransactionDto
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public string Type { get; set; } = null!;
    public decimal Amount { get; set; }
    public string? Note { get; set; }
}
