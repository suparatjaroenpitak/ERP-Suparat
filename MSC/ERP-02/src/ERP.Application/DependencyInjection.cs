using Microsoft.Extensions.DependencyInjection;
using ERP.Application.Services;
using ERP.Application.Interfaces;

namespace ERP.Application;

public static class ApplicationServiceRegistration
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IWorkflowEngine, ERP.Application.Services.WorkflowEngine>();
        // register other application services here (category/unit/warehouse/branch if needed)
        // add other application services, validators, mappings here
        return services;
    }
}
