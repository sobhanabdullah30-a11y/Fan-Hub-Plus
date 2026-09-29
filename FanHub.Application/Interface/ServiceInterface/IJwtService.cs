using System.Security.Claims;
using FanHub.Domain.Entities;

namespace FanHub.Application.Interface.ServiceInterface
{
    public interface IJwtService
    {
        DateTimeOffset GetExpiry();
        string GenerateToken(User user, DateTimeOffset expiresAt);
        Task<ClaimsPrincipal?> ValidateTokenAsync(string token);
    }
}
