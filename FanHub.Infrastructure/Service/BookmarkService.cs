using FanHub.Application.DTOs.Content;
using FanHub.Application.Common;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;

namespace FanHub.Infrastructure.Service
{
    public class BookmarkService : IBookmarkService
    {
        private readonly IBookmarkRepository _repository;

        public BookmarkService(IBookmarkRepository repository)
        {
            _repository = repository;
        }

        public Task<Page<object>> Bookmarks(Guid userId, int page, int size, CancellationToken cancellationToken, ContentFilter? filter = null)
        {
            return _repository.Bookmarks(userId, page, size, cancellationToken, filter);
        }

        public Task SaveBookmark(Guid userId, Guid contentId, string note, CancellationToken cancellationToken)
        {
            return _repository.SaveBookmark(userId, contentId, note, cancellationToken);
        }

        public Task RemoveBookmark(Guid userId, Guid contentId, CancellationToken cancellationToken)
        {
            return _repository.RemoveBookmark(userId, contentId, cancellationToken);
        }
    }
}
