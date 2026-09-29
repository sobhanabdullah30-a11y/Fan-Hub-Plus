using AutoMapper;
using FanHub.Application.DTOs.Rating;
using FanHub.Domain.Entities;

namespace FanHub.Application.MappingProfile.RatingProfile
{
    public class RatingProfile : Profile
    {
        public RatingProfile()
        {
            CreateMap<RatingForUpdation, Rating>(MemberList.None);
        }
    }
}
