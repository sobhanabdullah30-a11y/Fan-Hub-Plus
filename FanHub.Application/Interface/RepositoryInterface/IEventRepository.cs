using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Application.DTOs.Event;

namespace FanHub.Application.Interface.RepositoryInterface
{
    public interface IEventRepository
    {
        Task<Page<ContentDto>> Events(EventFilter filter, CancellationToken cancellationToken);
    }
}
