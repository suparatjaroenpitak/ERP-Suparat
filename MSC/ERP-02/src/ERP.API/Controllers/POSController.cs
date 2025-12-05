using Microsoft.AspNetCore.Mvc;
using ERP.Application.DTOs;
using ERP.Infrastructure.Data;
using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class POSController : ControllerBase
{
    private readonly AppDbContext _db;

    public POSController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest req)
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            UserId = req.UserId,
            Status = req.Draft ? OrderStatus.Draft : OrderStatus.Completed,
            TotalAmount = req.TotalAmount,
            TotalDiscount = req.TotalDiscount
        };

        foreach (var it in req.Items)
        {
            var oi = new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = it.ProductId,
                UnitPrice = it.UnitPrice,
                Quantity = it.Quantity,
                DiscountAmount = it.DiscountAmount,
                DiscountPercent = it.DiscountPercent,
            };
            order.Items.Add(oi);
        }

        _db.Orders.Add(order);
        // handle customer loyalty points
        int earnedPoints = 0;
        int customerPointsBalance = 0;
        if (req.CustomerId.HasValue)
        {
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == req.CustomerId.Value);
            if (customer != null)
            {
                // apply redeem if requested
                if (req.RedeemPoints > 0)
                {
                    var redeem = Math.Min(req.RedeemPoints, customer.PointsBalance);
                    // one point == 1 currency unit discount (business rule)
                    var redeemValue = redeem;
                    if (redeem > 0)
                    {
                        // reduce total discount by redeemValue (applies as additional discount)
                        order.TotalDiscount += redeemValue;
                        customer.PointsBalance -= redeem;
                        _db.LoyaltyPointTransactions.Add(new LoyaltyPointTransaction { Id = Guid.NewGuid(), CustomerId = customer.Id, PointsChange = -redeem, Type = LoyaltyTransactionType.Redeem, Description = $"Redeem {redeem} pts for order {order.Id}", OrderId = order.Id });
                    }
                }

                // compute earned points based on paid amount (simple rule: 1 point per 10 currency units)
                var paid = Math.Max(0, order.TotalAmount - order.TotalDiscount);
                earnedPoints = (int)Math.Floor(paid / 10m);
                if (earnedPoints > 0)
                {
                    customer.PointsBalance += earnedPoints;
                    _db.LoyaltyPointTransactions.Add(new LoyaltyPointTransaction { Id = Guid.NewGuid(), CustomerId = customer.Id, PointsChange = earnedPoints, Type = LoyaltyTransactionType.Earn, Description = $"Earn {earnedPoints} pts from order {order.Id}", OrderId = order.Id });
                }
                customerPointsBalance = customer.PointsBalance;
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new CheckoutResponse { OrderId = order.Id, EarnedPoints = earnedPoints, CustomerPointsBalance = customerPointsBalance });
    }

    [HttpPost("void")]
    public async Task<IActionResult> Void([FromBody] VoidRequest req)
    {
        var order = await _db.Orders.FindAsync(req.OrderId);
        if (order == null) return NotFound();
        if (order.Status == OrderStatus.Voided) return BadRequest("Already voided");
        order.Status = OrderStatus.Voided;
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("return")]
    public async Task<IActionResult> Return([FromBody] ReturnRequest req)
    {
        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == req.OrderId);
        if (order == null) return NotFound();

        var ret = new Return { Id = Guid.NewGuid(), OrderId = order.Id, Order = order, CreatedAt = DateTime.UtcNow };
        decimal totalRefund = 0;

        foreach (var it in req.Items)
        {
            var oi = order.Items.FirstOrDefault(x => x.Id == it.OrderItemId);
            if (oi == null) return BadRequest($"Order item {it.OrderItemId} not found");
            if (it.Quantity <= 0) continue;
            var canReturn = oi.Quantity - oi.ReturnedQuantity;
            var qty = Math.Min(canReturn, it.Quantity);
            if (qty <= 0) continue;
            oi.ReturnedQuantity += qty;
            var refundAmount = qty * oi.UnitPrice - oi.DiscountAmount * (qty / (decimal)oi.Quantity);
            var ri = new ReturnItem { Id = Guid.NewGuid(), OrderItemId = oi.Id, Quantity = qty, RefundAmount = refundAmount };
            ret.Items.Add(ri);
            totalRefund += refundAmount;
        }

        if (!ret.Items.Any()) return BadRequest("No valid return items");
        ret.RefundAmount = totalRefund;
        _db.Returns.Add(ret);
        order.Status = OrderStatus.Returned;
        await _db.SaveChangesAsync();

        return Ok(new { returnId = ret.Id, refund = totalRefund });
    }
}
