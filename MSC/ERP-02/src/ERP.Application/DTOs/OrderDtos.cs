namespace ERP.Application.DTOs;

public class OrderItemRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }
}

public class CheckoutRequest
{
    public Guid? UserId { get; set; }
    public List<OrderItemRequest> Items { get; set; } = new List<OrderItemRequest>();
    public decimal TotalAmount { get; set; }
    public decimal TotalDiscount { get; set; }
    public bool Draft { get; set; }
    public Guid? CustomerId { get; set; }
    public int RedeemPoints { get; set; }
}

public class CheckoutResponse
{
    public Guid OrderId { get; set; }
    public int EarnedPoints { get; set; }
    public int CustomerPointsBalance { get; set; }
}

public class VoidRequest
{
    public Guid OrderId { get; set; }
}

public class ReturnItemRequest
{
    public Guid OrderItemId { get; set; }
    public int Quantity { get; set; }
}

public class ReturnRequest
{
    public Guid OrderId { get; set; }
    public List<ReturnItemRequest> Items { get; set; } = new List<ReturnItemRequest>();
}
