using FanHub.Application.Common;
using FanHub.Application.DTOs.Chat;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;

namespace FanHub.Infrastructure.Service
{
    public class ChatService : IChatService
    {
        private readonly IChatRepository _repository;

        public ChatService(IChatRepository repository)
        {
            _repository = repository;
        }

        public Task<ChatMessage> Chat(Guid userId, ChatRequest request, CancellationToken cancellationToken)
        {
            return _repository.Chat(userId, request, cancellationToken);
        }

        public Task<Page<ChatMessage>> ChatHistory(Guid userId, Guid? conversationId, int page, int size, CancellationToken cancellationToken)
        {
            return _repository.ChatHistory(userId, conversationId, page, size, cancellationToken);
        }

        public Task DeleteChat(Guid userId, Guid conversationId, CancellationToken cancellationToken)
        {
            return _repository.DeleteChat(userId, conversationId, cancellationToken);
        }
    }
}
