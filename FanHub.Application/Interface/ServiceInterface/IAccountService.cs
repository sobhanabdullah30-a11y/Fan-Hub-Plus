using FanHub.Application.Common;
using FanHub.Application.DTOs.User;
using FanHub.Domain.Entities;

namespace FanHub.Application.Interface.ServiceInterface
{
    public interface IAccountService
    {
        Task Register(UserForCreation request, CancellationToken cancellationToken);
        Task RequestToken(string email, string purpose, CancellationToken cancellationToken);
        Task<SessionResult> VerifyEmail(string raw, CancellationToken cancellationToken);
        Task ResetPassword(ResetPasswordRequest request, CancellationToken cancellationToken);
        Task ChangePassword(Guid id, ChangePasswordRequest request, CancellationToken cancellationToken);
        Task RevokeAll(Guid id, CancellationToken cancellationToken);
        Task<SessionResult> Login(LoginRequest request, CancellationToken cancellationToken);
        Task<User?> Authenticate(string raw, CancellationToken cancellationToken);
        Task Logout(string raw, CancellationToken cancellationToken);
        Task<User> GetUser(Guid id, CancellationToken cancellationToken);
        Task<object> Profile(Guid id, CancellationToken cancellationToken);
        Task<object> UpdateProfile(Guid id, UserForUpdation request, CancellationToken cancellationToken);
        Task<Page<UserDto>> Users(int page, int size, CancellationToken cancellationToken);
        Task SetAccess(Guid actor, Guid id, UserAccessRequest request, CancellationToken cancellationToken);
        Task DeleteAccount(Guid actor, Guid id, CancellationToken cancellationToken);
    }
}
