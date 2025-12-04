using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ERP.Application.Interfaces;
using ERP.Infrastructure.Repositories;
using ERP.Infrastructure.Data;

namespace ERP.Infrastructure;

public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(opts =>
            opts.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // register repositories
        services.AddScoped<IProductRepository, ProductRepository>();

        return services;
    }
}