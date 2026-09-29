namespace FanHub.Application.Interface.ServiceInterface
{
    public interface IAnalyticsService
    {
        Task<object> Analytics(CancellationToken cancellationToken);
    }
}
