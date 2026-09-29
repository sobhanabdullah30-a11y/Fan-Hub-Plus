using AutoMapper;
using FanHub.Application.DTOs.Content;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Infrastructure.Repository
{
    public class AnalyticsRepository : IAnalyticsRepository
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public AnalyticsRepository(IRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<object> Analytics(CancellationToken cancellationToken)
        {
            var since = DateTimeOffset.UtcNow.AddDays(-30);
            return new
            {
                Users = await _repository.Count(_repository.Query<User>(), cancellationToken),
                ActiveUsersLast30Days = await _repository.Count(_repository.Query<Activity>().Where(x => x.CreatedAt >= since).Select(x => x.UserId).Distinct(), cancellationToken),
                PendingSubmissions = await _repository.Count(_repository.Query<Content>().Where(x => x.Status == PublicationStatus.Pending), cancellationToken),
                OpenFeedback = await _repository.Count(_repository.Query<Feedback>().Where(x => x.Status != FeedbackStatus.Resolved), cancellationToken),
                ChatbotInteractions = await _repository.Count(_repository.Query<ChatMessage>(), cancellationToken),
                PopularCategories = await _repository.List(_repository.Query<Content>().Where(x => x.Status == PublicationStatus.Published).GroupBy(x => x.CategoryId).Select(x => new { CategoryId = x.Key, Views = x.Sum(y => y.Views), Items = x.Count() }).OrderByDescending(x => x.Views), cancellationToken),
                PopularContent = (await _repository.List(_repository.Query<Content>().Where(x => x.Status == PublicationStatus.Published).OrderByDescending(x => x.Views).Take(10), cancellationToken)).Select(_mapper.Map<ContentDto>)
            };
        }
    }
}
