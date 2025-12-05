namespace ERP.Application.DTOs;

public class DailySalesPoint
{
    public string Date { get; set; } = null!; // yyyy-MM-dd
    public decimal Total { get; set; }
}

public class TopProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal Revenue { get; set; }
}

public class SalesReportDto
{
    public decimal TotalSales { get; set; }
    public List<DailySalesPoint> Daily { get; set; } = new List<DailySalesPoint>();
    public List<TopProductDto> TopProducts { get; set; } = new List<TopProductDto>();
}
