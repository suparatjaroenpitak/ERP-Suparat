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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
