using Microsoft.Extensions.DependencyInjection;
using ERP.Application.Services;
using ERP.Application.Interfaces;

namespace ERP.Application;

public static class ApplicationServiceRegistration
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        // add other application services, validators, mappings here
        return services;
    }
}
