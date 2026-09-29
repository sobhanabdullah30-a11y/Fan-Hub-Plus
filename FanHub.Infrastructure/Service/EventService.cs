using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Application.DTOs.Event;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;

namespace FanHub.Infrastructure.Service
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _repository;

        public EventService(IEventRepository repository)
        {
            _repository = repository;
        }

        public Task<Page<ContentDto>> Events(EventFilter filter, CancellationToken cancellationToken)
        {
            return _repository.Events(filter, cancellationToken);
        }
    }
}
