using AutoMapper;
using FanHub.Application.DTOs.Feedback;
using FanHub.Domain.Entities;

namespace FanHub.Application.MappingProfile.FeedbackProfile
{
    public class FeedbackProfile : Profile
    {
        public FeedbackProfile()
        {
            CreateMap<FeedbackForCreation, Feedback>(MemberList.None);
            CreateMap<FeedbackForUpdation, Feedback>(MemberList.None);
        }
    }
}
