using System;

namespace ERP.Domain.Entities;

public class CustomerCredit
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal CurrentBalance { get; set; } // outstanding AR amount
}
