using FanHub.Domain.Entities;

namespace FanHub.Application.Interface.ServiceInterface
{
    public interface IPasswordService
    {
        string Hash(User user, string password);
        bool Verify(User user, string password);
    }
}
