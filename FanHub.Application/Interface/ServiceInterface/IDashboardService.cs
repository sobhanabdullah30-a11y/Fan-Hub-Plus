using FanHub.Application.Common;
using FanHub.Domain.Entities;

namespace FanHub.Application.Interface.ServiceInterface
{
    public interface IDashboardService
    {
        Task<Page<Activity>> RecentActivity(Guid userId, int page, int pageSize, CancellationToken cancellationToken);
        Task<object> Dashboard(Guid id, CancellationToken cancellationToken);
    }
}
