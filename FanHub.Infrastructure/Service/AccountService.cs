using FanHub.Application.Common;
using FanHub.Application.DTOs.User;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;

namespace FanHub.Infrastructure.Service
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _repository;

        public AccountService(IAccountRepository repository)
        {
            _repository = repository;
        }

        public Task Register(UserForCreation request, CancellationToken cancellationToken)
        {
            return _repository.Register(request, cancellationToken);
        }

        public Task RequestToken(string email, string purpose, CancellationToken cancellationToken)
        {
            return _repository.RequestToken(email, purpose, cancellationToken);
        }

        public Task<SessionResult> VerifyEmail(string raw, CancellationToken cancellationToken)
        {
            return _repository.VerifyEmail(raw, cancellationToken);
        }

        public Task ResetPassword(ResetPasswordRequest request, CancellationToken cancellationToken)
        {
            return _repository.ResetPassword(request, cancellationToken);
        }

        public Task ChangePassword(Guid id, ChangePasswordRequest request, CancellationToken cancellationToken)
        {
            return _repository.ChangePassword(id, request, cancellationToken);
        }

        public Task RevokeAll(Guid id, CancellationToken cancellationToken)
        {
            return _repository.RevokeAll(id, cancellationToken);
        }

        public Task<SessionResult> Login(LoginRequest request, CancellationToken cancellationToken)
        {
            return _repository.Login(request, cancellationToken);
        }

        public Task<User?> Authenticate(string raw, CancellationToken cancellationToken)
        {
            return _repository.Authenticate(raw, cancellationToken);
        }

        public Task Logout(string raw, CancellationToken cancellationToken)
        {
            return _repository.Logout(raw, cancellationToken);
        }

        public Task<User> GetUser(Guid id, CancellationToken cancellationToken)
        {
            return _repository.GetUser(id, cancellationToken);
        }

        public Task<object> Profile(Guid id, CancellationToken cancellationToken)
        {
            return _repository.Profile(id, cancellationToken);
        }

        public Task<object> UpdateProfile(Guid id, UserForUpdation request, CancellationToken cancellationToken)
        {
            return _repository.UpdateProfile(id, request, cancellationToken);
        }

        public Task<Page<UserDto>> Users(int page, int size, CancellationToken cancellationToken)
        {
            return _repository.Users(page, size, cancellationToken);
        }

        public Task SetAccess(Guid actor, Guid id, UserAccessRequest request, CancellationToken cancellationToken)
        {
            return _repository.SetAccess(actor, id, request, cancellationToken);
        }

        public Task DeleteAccount(Guid actor, Guid id, CancellationToken cancellationToken)
        {
            return _repository.DeleteAccount(actor, id, cancellationToken);
        }
    }
}
