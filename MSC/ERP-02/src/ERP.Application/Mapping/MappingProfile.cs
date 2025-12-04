using AutoMapper;
using ERP.Application.DTOs;
using ERP.Domain.Entities;

namespace ERP.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Product, ProductDto>();
    }
}
