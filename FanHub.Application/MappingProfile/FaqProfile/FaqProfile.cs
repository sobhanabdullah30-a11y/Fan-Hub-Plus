using AutoMapper;
using FanHub.Application.DTOs.Faq;
using FanHub.Domain.Entities;

namespace FanHub.Application.MappingProfile.FaqProfile
{
    public class FaqProfile : Profile
    {
        public FaqProfile()
        {
            CreateMap<FaqForCreation, Faq>(MemberList.None);
        }
    }
}
