using System;
using System.Collections.Generic;

namespace ERP.Application.DTOs;

public class PlLineDto
{
    public string AccountCode { get; set; } = null!;
    public string AccountName { get; set; } = null!;
    public decimal Amount { get; set; }
}

public class PlReportDto
{
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public List<PlLineDto> Revenues { get; set; } = new();
    public List<PlLineDto> Expenses { get; set; } = new();
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal NetProfit => TotalRevenue - TotalExpense;
}

public class BalanceLineDto
{
    public string AccountCode { get; set; } = null!;
    public string AccountName { get; set; } = null!;
    public decimal Amount { get; set; }
}

public class BalanceSheetDto
{
    public DateTime AsOf { get; set; }
    public List<BalanceLineDto> Assets { get; set; } = new();
    public List<BalanceLineDto> Liabilities { get; set; } = new();
    public List<BalanceLineDto> Equity { get; set; } = new();
    public decimal TotalAssets { get; set; }
    public decimal TotalLiabilities { get; set; }
    public decimal TotalEquity { get; set; }
}

public class GpProductLineDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public decimal Revenue { get; set; }
    public decimal COGS { get; set; }
    public decimal GrossProfit => Revenue - COGS;
}

public class GpReportDto
{
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public List<GpProductLineDto> Lines { get; set; } = new();
    public decimal TotalRevenue => Lines.Sum(l => l.Revenue);
    public decimal TotalCogs => Lines.Sum(l => l.COGS);
    public decimal TotalGrossProfit => TotalRevenue - TotalCogs;
}

public class StockMovementDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public Guid? WarehouseId { get; set; }
    public DateTime Date { get; set; }
    public string Type { get; set; } = null!;
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string? Reference { get; set; }
}

public class AgingBucketDto
{
    public string Bucket { get; set; } = null!;
    public decimal Amount { get; set; }
}

public class AgingArCustomerDto
{
    public Guid CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public decimal Outstanding { get; set; }
    public List<AgingBucketDto> Buckets { get; set; } = new();
}

public class ProductSalesRankDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public decimal Quantity { get; set; }
    public decimal Revenue { get; set; }
}

