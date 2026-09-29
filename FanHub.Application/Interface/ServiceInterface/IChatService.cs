using FanHub.Application.Common;
using FanHub.Application.DTOs.Chat;
using FanHub.Domain.Entities;

namespace FanHub.Application.Interface.ServiceInterface
{
    public interface IChatService
    {
        Task<ChatMessage> Chat(Guid userId, ChatRequest request, CancellationToken cancellationToken);
        Task<Page<ChatMessage>> ChatHistory(Guid userId, Guid? conversationId, int page, int size, CancellationToken cancellationToken);
        Task DeleteChat(Guid userId, Guid conversationId, CancellationToken cancellationToken);
    }
}
