using FanHub.Application.DTOs.Content;
using FanHub.Application.Common;

namespace FanHub.Application.Interface.ServiceInterface
{
    public interface IBookmarkService
    {
        Task<Page<object>> Bookmarks(Guid userId, int page, int size, CancellationToken cancellationToken, ContentFilter? filter = null);
        Task SaveBookmark(Guid userId, Guid contentId, string note, CancellationToken cancellationToken);
        Task RemoveBookmark(Guid userId, Guid contentId, CancellationToken cancellationToken);
    }
}
