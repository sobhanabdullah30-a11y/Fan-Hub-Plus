using FanHub.Application.Common;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;

namespace FanHub.Infrastructure.Service
{
    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _repository;

        public DashboardService(IDashboardRepository repository)
        {
            _repository = repository;
        }

        public Task<Page<Activity>> RecentActivity(Guid userId, int page, int pageSize, CancellationToken cancellationToken)
        {
            return _repository.RecentActivity(userId, page, pageSize, cancellationToken);
        }

        public Task<object> Dashboard(Guid id, CancellationToken cancellationToken)
        {
            return _repository.Dashboard(id, cancellationToken);
        }
    }
}
