using AutoMapper;
using FanHub.Application.DTOs.User;
using FanHub.Domain.Entities;

namespace FanHub.Application.MappingProfile.UserProfile
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, UserDto>();
            CreateMap<UserForCreation, User>(MemberList.None);
            CreateMap<UserForUpdation, User>(MemberList.None);
        }
    }
}
