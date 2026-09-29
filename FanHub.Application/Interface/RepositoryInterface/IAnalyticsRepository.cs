namespace FanHub.Application.Interface.RepositoryInterface
{
    public interface IAnalyticsRepository
    {
        Task<object> Analytics(CancellationToken cancellationToken);
    }
}
