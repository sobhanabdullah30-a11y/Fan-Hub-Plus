namespace FanHub.Application.Interface.ServiceInterface
{
    public interface IAccountMailer
    {
        Task Send(string email, string purpose, string token, CancellationToken cancellationToken);
    }
}
