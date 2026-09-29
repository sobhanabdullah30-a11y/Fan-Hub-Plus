using System.Security.Claims;
using System.Text;
using FanHub.Application.Configuration;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace FanHub.Infrastructure.Service
{
    public class JwtService : IJwtService
    {
        private readonly JwtSettings _settings;

        public JwtService(JwtSettings settings)
        {
            if (Encoding.UTF8.GetByteCount(settings.Key) < 32 || string.IsNullOrWhiteSpace(settings.Issuer) || string.IsNullOrWhiteSpace(settings.Audience) || settings.ExpiryInMinutes is < 1 or > 1440)
            {
                throw new InvalidOperationException("Configure Jwt:Key (at least 32 bytes), Issuer, Audience and ExpiryInMinutes (1-1440).");
            }

            _settings = settings;
        }

        public DateTimeOffset GetExpiry()
        {
            return DateTimeOffset.UtcNow.AddMinutes(_settings.ExpiryInMinutes);
        }

        public string GenerateToken(User user, DateTimeOffset expiresAt)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.DisplayName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var descriptor = new SecurityTokenDescriptor
            {
                Issuer = _settings.Issuer,
                Audience = _settings.Audience,
                Subject = new ClaimsIdentity(claims),
                Expires = expiresAt.UtcDateTime,
                SigningCredentials = credentials
            };
            var handler = new JsonWebTokenHandler { SetDefaultTimesOnTokenCreation = false };
            return handler.CreateToken(descriptor);
        }

        public async Task<ClaimsPrincipal?> ValidateTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token) || token.Length > 8192)
            {
                return null;
            }

            try
            {
                var handler = new JsonWebTokenHandler { MapInboundClaims = false };
                var result = await handler.ValidateTokenAsync(token, ValidationParameters(_settings));
                return result.IsValid ? new ClaimsPrincipal(result.ClaimsIdentity) : null;
            }
            catch (SecurityTokenException)
            {
                return null;
            }
            catch (ArgumentException)
            {
                return null;
            }
        }

        public static TokenValidationParameters ValidationParameters(JwtSettings settings)
        {
            return new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                RequireSignedTokens = true,
                RequireExpirationTime = true,
                ValidIssuer = settings.Issuer,
                ValidAudience = settings.Audience,
                ValidAlgorithms = new[]
                {
                    SecurityAlgorithms.HmacSha256
                },
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Key)),
                NameClaimType = ClaimTypes.Name,
                RoleClaimType = ClaimTypes.Role,
                ClockSkew = TimeSpan.Zero
            };
        }
    }
}
