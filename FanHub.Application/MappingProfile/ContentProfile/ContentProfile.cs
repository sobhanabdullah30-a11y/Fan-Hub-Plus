using AutoMapper;
using FanHub.Application.DTOs.Content;
using FanHub.Domain.Entities;

namespace FanHub.Application.MappingProfile.ContentProfile
{
    public class ContentProfile : Profile
    {
        public ContentProfile()
        {
            CreateMap<Content, ContentDto>();
            CreateMap<ContentForCreation, Content>(MemberList.None);
        }
    }
}
