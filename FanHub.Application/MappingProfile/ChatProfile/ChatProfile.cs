using AutoMapper;
using FanHub.Application.DTOs.Chat;
using FanHub.Domain.Entities;

namespace FanHub.Application.MappingProfile.ChatProfile
{
    public class ChatProfile : Profile
    {
        public ChatProfile()
        {
            CreateMap<ChatRequest, ChatMessage>(MemberList.None);
        }
    }
}
