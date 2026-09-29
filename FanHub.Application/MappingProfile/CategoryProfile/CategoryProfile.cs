using AutoMapper;
using FanHub.Application.DTOs.Category;
using FanHub.Domain.Entities;

namespace FanHub.Application.MappingProfile.CategoryProfile
{
    public class CategoryProfile : Profile
    {
        public CategoryProfile()
        {
            CreateMap<CategoryForCreation, Category>(MemberList.None);
        }
    }
}
