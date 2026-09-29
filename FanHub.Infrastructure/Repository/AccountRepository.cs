using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.User;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;

namespace FanHub.Infrastructure.Repository
{
    public class AccountRepository : IAccountRepository
    {
        private readonly IRepository _repository;
        private readonly IPasswordService _passwords;
        private readonly ITokenService _tokens;
        private readonly IAccountMailer _mailer;
        private readonly IJwtService _jwt;
        private readonly IMapper _mapper;

        public AccountRepository(
            IRepository repository,
            IPasswordService passwords,
            ITokenService tokens,
            IAccountMailer mailer,
            IJwtService jwt,
            IMapper mapper)
        {
            _repository = repository;
            _passwords = passwords;
            _tokens = tokens;
            _mailer = mailer;
            _jwt = jwt;
            _mapper = mapper;
        }

        public async Task Register(UserForCreation request, CancellationToken cancellationToken)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var existing = await _repository.First(_repository.Query<User>().Where(x => x.Email == email), cancellationToken);
            if (existing != null)
            {
                if (existing.EmailVerified)
                {
                    throw new AppException(409, "An account with this email already exists. Sign in or reset your password.");
                }

                // Allow a failed email delivery to be retried without replacing an unverified account.
                if (existing.IsActive && !existing.EmailVerified && _passwords.Verify(existing, request.Password))
                {
                    await Issue(existing, "verify-email", cancellationToken);
                    return;
                }

                throw new AppException(409, "This email is already registered. Use resend verification email or reset password.");
            }

            var user = _mapper.Map<User>(request);
            user.Email = email;
            user.DisplayName = request.DisplayName.Trim();
            if (string.IsNullOrWhiteSpace(user.DisplayName))
            {
                throw new AppException(400, "Display name is required.");
            }

            user.PasswordHash = _passwords.Hash(user, request.Password);
            _repository.Add(user);
            await Issue(user, "verify-email", cancellationToken);
        }

        private async Task Issue(User user, string purpose, CancellationToken cancellationToken)
        {
            foreach (var old in await _repository.List(_repository.Query<AccountToken>().Where(x => x.UserId == user.Id && x.Purpose == purpose && !x.Used), cancellationToken))
            {
                old.Used = true;
            }

            var raw = _tokens.Create();
            _repository.Add(new AccountToken { UserId = user.Id, Purpose = purpose, TokenHash = _tokens.Hash(raw), ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(purpose == "reset-password" ? 30 : 1440) });
            await _repository.Save(cancellationToken);
            await _mailer.Send(user.Email, purpose, raw, cancellationToken);
        }

        public async Task RequestToken(string email, string purpose, CancellationToken cancellationToken)
        {
            var normalized = email.Trim().ToLowerInvariant();
            var user = await _repository.First(_repository.Query<User>().Where(x => x.Email == normalized && x.IsActive), cancellationToken);
            if (user == null || (purpose == "verify-email" && user.EmailVerified))
            {
                return;
            }

            await Issue(user, purpose, cancellationToken);
        }

        private async Task<(User, AccountToken)> Consume(string raw, string purpose, CancellationToken cancellationToken)
        {
            var hash = _tokens.Hash(raw);
            var token = await _repository.First(_repository.Query<AccountToken>().Where(x => x.TokenHash == hash && x.Purpose == purpose && !x.Used && x.ExpiresAt > DateTimeOffset.UtcNow), cancellationToken) ?? throw new AppException(400, "Invalid or expired token.");
            var user = await GetUser(token.UserId, cancellationToken);
            if (!user.IsActive)
            {
                throw new AppException(400, "Invalid or expired token.");
            }

            token.Used = true;
            return (user, token);
        }

        public async Task<SessionResult> VerifyEmail(string raw, CancellationToken cancellationToken)
        {
            var (user, _) = await Consume(raw, "verify-email", cancellationToken);
            user.EmailVerified = true;
            return await CreateSession(user, cancellationToken);
        }

        public async Task ResetPassword(ResetPasswordRequest request, CancellationToken cancellationToken)
        {
            var (user, _) = await Consume(request.Token, "reset-password", cancellationToken);
            user.PasswordHash = _passwords.Hash(user, request.Password);
            await RevokeAll(user.Id, cancellationToken);
            await _repository.Save(cancellationToken);
        }

        public async Task ChangePassword(Guid id, ChangePasswordRequest request, CancellationToken cancellationToken)
        {
            var user = await GetUser(id, cancellationToken);
            if (!_passwords.Verify(user, request.CurrentPassword))
            {
                throw new AppException(400, "Current password is incorrect.");
            }

            user.PasswordHash = _passwords.Hash(user, request.NewPassword);
            await RevokeAll(id, cancellationToken);
            await _repository.Save(cancellationToken);
        }

        public async Task RevokeAll(Guid id, CancellationToken cancellationToken)
        {
            foreach (var session in await _repository.List(_repository.Query<Session>().Where(x => x.UserId == id && !x.Revoked), cancellationToken))
            {
                session.Revoked = true;
            }
        }

        public async Task<SessionResult> Login(LoginRequest request, CancellationToken cancellationToken)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var user = await _repository.First(_repository.Query<User>().Where(x => x.Email == email), cancellationToken);
            if (user == null || !_passwords.Verify(user, request.Password) || !user.IsActive)
            {
                throw new AppException(401, "Invalid email or password.");
            }

            if (!user.EmailVerified)
            {
                throw new AppException(403, "Verify your email before signing in.");
            }

            return await CreateSession(user, cancellationToken);
        }

        private async Task<SessionResult> CreateSession(User user, CancellationToken cancellationToken)
        {
            var expiry = _jwt.GetExpiry();
            var raw = _jwt.GenerateToken(user, expiry);
            _repository.Add(new Session { UserId = user.Id, TokenHash = _tokens.Hash(raw), ExpiresAt = expiry });
            user.LastActiveAt = DateTimeOffset.UtcNow;
            _repository.Add(new Activity { UserId = user.Id, Action = "Signed in" });
            await _repository.Save(cancellationToken);
            return new(raw, expiry, _mapper.Map<UserDto>(user));
        }

        public async Task<User?> Authenticate(string raw, CancellationToken cancellationToken)
        {
            var principal = await _jwt.ValidateTokenAsync(raw);
            if (principal == null)
            {
                return null;
            }

            var hash = _tokens.Hash(raw);
            var session = await _repository.First(_repository.Query<Session>().Where(x => x.TokenHash == hash && !x.Revoked && x.ExpiresAt > DateTimeOffset.UtcNow), cancellationToken);
            if (session != null && principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value != session.UserId.ToString())
            {
                return null;
            }

            return session == null ? null : await _repository.First(_repository.Query<User>().Where(x => x.Id == session.UserId && x.IsActive && x.EmailVerified), cancellationToken);
        }

        public async Task Logout(string raw, CancellationToken cancellationToken)
        {
            var hash = _tokens.Hash(raw);
            var session = await _repository.First(_repository.Query<Session>().Where(x => x.TokenHash == hash), cancellationToken);
            if (session != null)
            {
                session.Revoked = true;
                await _repository.Save(cancellationToken);
            }
        }

        public async Task<User> GetUser(Guid id, CancellationToken cancellationToken)
        {
            return await _repository.First(_repository.Query<User>().Where(x => x.Id == id), cancellationToken) ?? throw new AppException(404, "User not found.");
        }

        public async Task<object> Profile(Guid id, CancellationToken cancellationToken)
        {
            return new
            {
                User = _mapper.Map<UserDto>(await GetUser(id, cancellationToken)),
                CategoryIds = await _repository.List(_repository.Query<UserInterest>().Where(x => x.UserId == id).Select(x => x.CategoryId), cancellationToken)
            };
        }

        public async Task<object> UpdateProfile(Guid id, UserForUpdation request, CancellationToken cancellationToken)
        {
            RequestValidation.CheckUrl(request.AvatarUrl);
            if (string.IsNullOrWhiteSpace(request.DisplayName) || request.FavoriteFandoms.Any(x => string.IsNullOrWhiteSpace(x) || x.Length > 100))
            {
                throw new AppException(400, "Invalid display name or fandom.");
            }

            var ids = request.CategoryIds.Distinct().ToList();
            if (await _repository.Count(_repository.Query<Category>().Where(x => ids.Contains(x.Id)), cancellationToken) != ids.Count)
            {
                throw new AppException(400, "Unknown category.");
            }

            var user = await GetUser(id, cancellationToken);
            _mapper.Map(request, user);
            user.DisplayName = request.DisplayName.Trim();
            user.FavoriteFandoms = request.FavoriteFandoms.Distinct().ToList();
            foreach (var old in await _repository.List(_repository.Query<UserInterest>().Where(x => x.UserId == id), cancellationToken))
            {
                _repository.Remove(old);
            }

            foreach (var categoryId in ids)
            {
                _repository.Add(new UserInterest { UserId = id, CategoryId = categoryId });
            }

            await _repository.Save(cancellationToken);
            return await Profile(id, cancellationToken);
        }

        public async Task<Page<UserDto>> Users(int page, int size, CancellationToken cancellationToken)
        {
            RequestValidation.CheckPage(page, size);
            var query = _repository.Query<User>();
            var total = await _repository.Count(query, cancellationToken);
            var users = await _repository.List(query.OrderBy(x => x.Email).Skip((page - 1) * size).Take(size), cancellationToken);
            return new(users.Select(_mapper.Map<UserDto>).ToList(), total, page, size);
        }

        public async Task SetAccess(Guid actor, Guid id, UserAccessRequest request, CancellationToken cancellationToken)
        {
            if (!Enum.IsDefined(request.Role))
            {
                throw new AppException(400, "Invalid role.");
            }

            if (actor == id)
            {
                throw new AppException(400, "You cannot change your own administrative access.");
            }

            var user = await GetUser(id, cancellationToken);
            user.Role = request.Role;
            user.IsActive = request.IsActive;
            await RevokeAll(id, cancellationToken);
            await _repository.Save(cancellationToken);
        }

        public async Task DeleteAccount(Guid actor, Guid id, CancellationToken cancellationToken)
        {
            if (actor == id)
            {
                throw new AppException(400, "You cannot delete your own account.");
            }

            var user = await GetUser(id, cancellationToken);
            var authoredContent = await _repository.List(
                _repository.Query<Content>().Where(x => x.AuthorId == id), cancellationToken);
            foreach (var content in authoredContent)
            {
                // Keep published community work available after its account is removed.
                content.AuthorId = actor;
            }

            var bookmarks = await _repository.List(
                _repository.Query<Bookmark>().Where(x => x.UserId == id), cancellationToken);
            var ratings = await _repository.List(
                _repository.Query<Rating>().Where(x => x.UserId == id), cancellationToken);
            var feedback = await _repository.List(
                _repository.Query<Feedback>().Where(x => x.UserId == id), cancellationToken);

            foreach (var item in bookmarks) _repository.Remove(item);
            foreach (var item in ratings) _repository.Remove(item);
            foreach (var item in feedback) _repository.Remove(item);

            _repository.Remove(user);
            await _repository.Save(cancellationToken);
        }
    }
}
