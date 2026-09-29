using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Application.DTOs.Event;

namespace FanHub.Application.Interface.ServiceInterface
{
    public interface IEventService
    {
        Task<Page<ContentDto>> Events(EventFilter filter, CancellationToken cancellationToken);
    }
}
