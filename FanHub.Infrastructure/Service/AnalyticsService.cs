using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;

namespace FanHub.Infrastructure.Service
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IAnalyticsRepository _repository;

        public AnalyticsService(IAnalyticsRepository repository)
        {
            _repository = repository;
        }

        public Task<object> Analytics(CancellationToken cancellationToken)
        {
            return _repository.Analytics(cancellationToken);
        }
    }
}
