using ERP.Application;
using ERP.Infrastructure;
using ERP.Application.Mapping;
using ERP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Configuration
var configuration = builder.Configuration;

// Add services
builder.Services.AddControllers()
    .AddFluentValidation(cfg => cfg.RegisterValidatorsFromAssembly(typeof(ApplicationServiceRegistration).Assembly));

// Application infra registrations
builder.Services.AddApplication();
builder.Services.AddInfrastructure(configuration);

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// Health checks - verify DbContext
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>(name: "sql-db");

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication
var jwtSection = configuration.GetSection("Jwt");
var key = jwtSection.GetValue<string>("Key") ?? "please-change-this-secret-for-production";
var issuer = jwtSection.GetValue<string>("Issuer") ?? "erp";
var audience = jwtSection.GetValue<string>("Audience") ?? "erp-client";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(key)),
    };
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Serve static files (for uploaded images)
app.UseStaticFiles();

// Ensure uploads folder exists
var webRoot = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
var uploadsFolder = Path.Combine(webRoot, "uploads");
if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
