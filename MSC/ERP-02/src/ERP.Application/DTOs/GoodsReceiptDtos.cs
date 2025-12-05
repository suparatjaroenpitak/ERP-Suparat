using System;
using System.Collections.Generic;

namespace ERP.Application.DTOs;

public class GoodsReceiptLineCreateDto
{
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitCost { get; set; }
}

public class GoodsReceiptCreateDto
{
    public Guid PurchaseOrderId { get; set; }
    public Guid WarehouseId { get; set; }
    public string? Reference { get; set; }
    public List<GoodsReceiptLineCreateDto> Lines { get; set; } = new();
}
