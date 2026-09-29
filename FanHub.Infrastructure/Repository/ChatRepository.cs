using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Chat;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;

namespace FanHub.Infrastructure.Repository
{
    public class ChatRepository : IChatRepository
    {
        private readonly IRepository _repository;
        private readonly IFaqRepository _faqs;
        private readonly IMapper _mapper;
        private readonly IGenerativeAiService _generativeAi;

        public ChatRepository(IRepository repository, IFaqRepository faqs, IMapper mapper, IGenerativeAiService generativeAi)
        {
            _repository = repository;
            _faqs = faqs;
            _mapper = mapper;
            _generativeAi = generativeAi;
        }

        public async Task<ChatMessage> Chat(Guid userId, ChatRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                throw new AppException(400, "Message is required.");
            }

            if (request.ConversationId is Guid existing && await _repository.First(_repository.Query<ChatMessage>().Where(x => x.ConversationId == existing && x.UserId == userId), cancellationToken) == null)
            {
                throw new AppException(404, "Conversation not found.");
            }

            var answers = await _faqs.Faqs(false, cancellationToken);
            var knowledgeBase = string.Join("\n", answers
                .Take(12)
                .Select(faq => $"Q: {faq.Question}\nA: {faq.Answer}"));
            var response = await _generativeAi.GenerateResponse(request.Message, knowledgeBase, cancellationToken)
                ?? FindFallbackResponse(request.Message, answers);
            var chat = _mapper.Map<ChatMessage>(request);
            chat.UserId = userId;
            chat.ConversationId = request.ConversationId ?? Guid.NewGuid();
            chat.Response = response;
            _repository.Add(chat);
            await _repository.Save(cancellationToken);
            return chat;
        }

        private static string FindFallbackResponse(string message, IEnumerable<Faq> answers)
        {
            var words = message.ToLowerInvariant()
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Where(word => word.Length > 2)
                .Distinct()
                .ToList();
            var match = answers
                .Select(faq => new
                {
                    Faq = faq,
                    Score = words.Count(word => faq.Question.Contains(word, StringComparison.OrdinalIgnoreCase))
                })
                .Where(item => item.Score > 0)
                .OrderByDescending(item => item.Score)
                .FirstOrDefault();

            return match?.Faq.Answer
                ?? "Browse categories, search content, open an item, then bookmark it from your account. For more help, submit a query through the feedback form.";
        }

        public async Task<Page<ChatMessage>> ChatHistory(Guid userId, Guid? conversationId, int page, int size, CancellationToken cancellationToken)
        {
            RequestValidation.CheckPage(page, size);
            var query = _repository.Query<ChatMessage>().Where(x => x.UserId == userId);
            if (conversationId != null)
            {
                query = query.Where(x => x.ConversationId == conversationId);
            }

            return new(await _repository.List(query.OrderByDescending(x => x.CreatedAt).Skip((page - 1) * size).Take(size), cancellationToken), await _repository.Count(query, cancellationToken), page, size);
        }

        public async Task DeleteChat(Guid userId, Guid conversationId, CancellationToken cancellationToken)
        {
            foreach (var m in await _repository.List(_repository.Query<ChatMessage>().Where(x => x.UserId == userId && x.ConversationId == conversationId), cancellationToken))
            {
                _repository.Remove(m);
            }

            await _repository.Save(cancellationToken);
        }
    }
}
