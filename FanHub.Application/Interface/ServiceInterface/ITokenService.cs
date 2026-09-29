namespace FanHub.Application.Interface.ServiceInterface
{
    public interface ITokenService
    {
        string Create();
        string Hash(string token);
    }
}
