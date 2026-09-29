using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Infrastructure.Repository
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly IRepository _repository;
        private readonly IBookmarkRepository _bookmarks;
        private readonly IMapper _mapper;

        public DashboardRepository(IRepository repository, IBookmarkRepository bookmarks, IMapper mapper)
        {
            _repository = repository;
            _bookmarks = bookmarks;
            _mapper = mapper;
        }

        public async Task<Page<Activity>> RecentActivity(Guid userId, int page, int pageSize, CancellationToken cancellationToken)
        {
            RequestValidation.CheckPage(page, pageSize);
            var query = _repository.Query<Activity>().Where(activity => activity.UserId == userId);
            var total = await _repository.Count(query, cancellationToken);
            var items = await _repository.List(query.OrderByDescending(activity => activity.CreatedAt).ThenBy(activity => activity.Id).Skip((page - 1) * pageSize).Take(pageSize), cancellationToken);
            return new Page<Activity>(items, total, page, pageSize);
        }

        public async Task<object> Dashboard(Guid id, CancellationToken cancellationToken)
        {
            var user = await _repository.First(_repository.Query<User>().Where(x => x.Id == id), cancellationToken) ?? throw new AppException(404, "User not found.");
            var ids = await _repository.List(_repository.Query<UserInterest>().Where(x => x.UserId == id).Select(x => x.CategoryId), cancellationToken);
            var recent = await _repository.List(_repository.Query<Activity>().Where(x => x.UserId == id).OrderByDescending(x => x.CreatedAt).Take(20), cancellationToken);
            var recommendations = await _repository.List(_repository.Query<Content>().Where(x => x.Status == PublicationStatus.Published && ((ids.Count == 0 && user.FavoriteFandoms.Count == 0) || ids.Contains(x.CategoryId) || user.FavoriteFandoms.Contains(x.Fandom))).OrderByDescending(x => x.CreatedAt).Take(12), cancellationToken);
            return new
            {
                Greeting = "Hello, " + user.DisplayName,
                user.FavoriteFandoms,
                CategoryIds = ids,
                RecentActivity = recent,
                Bookmarks = await _bookmarks.Bookmarks(id, 1, 12, cancellationToken),
                Recommendations = recommendations.Select(_mapper.Map<ContentDto>)
            };
        }
    }
}
