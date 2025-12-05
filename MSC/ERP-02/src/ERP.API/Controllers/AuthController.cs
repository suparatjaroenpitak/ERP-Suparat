using Microsoft.AspNetCore.Mvc;
using ERP.Application.DTOs;
using ERP.Infrastructure.Data;
using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Username and password required");

        var user = await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Username == req.Username);

        if (user == null)
        {
            // create demo user if not exists (for convenience) - create a default role
            user = new User { Id = Guid.NewGuid(), Username = req.Username, PasswordHash = ComputeHash(req.Password) };
            var adminRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
            if (adminRole == null)
            {
                adminRole = new Role { Id = Guid.NewGuid(), Name = "Admin" };
                await _db.Roles.AddAsync(adminRole);
            }
            user.UserRoles.Add(new UserRole { User = user, Role = adminRole });
            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();
        }

        if (user.PasswordHash != ComputeHash(req.Password))
            return Unauthorized();

        var perms = user.UserRoles.SelectMany(ur => ur.Role.RolePermissions).Select(rp => rp.Permission.Name).Distinct().ToList();

        var token = GenerateJwtToken(user, perms);

        var resp = new LoginResponse
        {
            Token = token,
            Username = user.Username,
            UserId = user.Id,
            Permissions = perms
        };

        return Ok(resp);
    }

    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleRequest req)
    {
        var user = await _db.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == req.UserId);
        if (user == null) return NotFound("User not found");

        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == req.RoleName);
        if (role == null)
        {
            role = new Role { Id = Guid.NewGuid(), Name = req.RoleName };
            await _db.Roles.AddAsync(role);
        }

        if (!user.UserRoles.Any(ur => ur.RoleId == role.Id))
        {
            user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
            await _db.SaveChangesAsync();
        }

        return Ok();
    }

    [HttpGet("check-permission")]
    public async Task<IActionResult> CheckPermission([FromQuery] string permission)
    {
        if (string.IsNullOrWhiteSpace(permission)) return BadRequest();

        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (authHeader == null || !authHeader.StartsWith("Bearer ")) return Unauthorized();
        var token = authHeader.Substring("Bearer ".Length).Trim();

        var handler = new JwtSecurityTokenHandler();
        JwtSecurityToken? jwt = null;
        try
        {
            jwt = handler.ReadJwtToken(token);
        }
        catch
        {
            return Unauthorized();
        }

        var userIdClaim = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
        if (userIdClaim == null) return Unauthorized();

        var userId = Guid.Parse(userIdClaim);
        var user = await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return Unauthorized();

        var perms = user.UserRoles.SelectMany(ur => ur.Role.RolePermissions).Select(rp => rp.Permission.Name).Distinct();
        var allowed = perms.Contains(permission);
        return Ok(new { permission, allowed });
    }

    private static string ComputeHash(string input)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToHexString(hash);
    }

    private string GenerateJwtToken(User user, List<string> permissions)
    {
        var jwtSection = _config.GetSection("Jwt");
        var key = jwtSection.GetValue<string>("Key") ?? "please-change-this-secret-key";
        var issuer = jwtSection.GetValue<string>("Issuer") ?? "erp";
        var audience = jwtSection.GetValue<string>("Audience") ?? "erp-client";
        var expiresMinutes = jwtSection.GetValue<int?>("ExpiresMinutes") ?? 60;

        var claims = new List<Claim>
        {
            new Claim("id", user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
        };
        foreach (var p in permissions)
        {
            claims.Add(new Claim("perm", p));
        }

        var keyBytes = Encoding.UTF8.GetBytes(key);
        var securityKey = new SymmetricSecurityKey(keyBytes);
        var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(issuer: issuer, audience: audience, claims: claims, expires: DateTime.UtcNow.AddMinutes(expiresMinutes), signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
