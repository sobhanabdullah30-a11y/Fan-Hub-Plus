using System.Security.Claims;
using System.Security.Cryptography;
using FanHub.Application.Configuration;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Infrastructure.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace FanHub.Api.Configuration
{
    public static class JwtConfiguration
    {
        public static IServiceCollection AddFanHubJwt(this IServiceCollection services, IConfiguration configuration, bool development)
        {
            var settings = configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
            if (string.IsNullOrWhiteSpace(settings.Key) && development)
            {
                settings.Key = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
            }

            var jwtService = new JwtService(settings);
            services.AddSingleton(settings);
            services.AddSingleton<IJwtService>(jwtService);
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = JwtService.ValidationParameters(settings);
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var token = context.Request.Headers.Authorization.ToString()["Bearer ".Length..].Trim();
                        var accounts = context.HttpContext.RequestServices.GetRequiredService<IAccountService>();
                        var user = await accounts.Authenticate(token, context.HttpContext.RequestAborted);
                        if (user == null || context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier) != user.Id.ToString() || context.Principal.FindFirstValue(ClaimTypes.Role) != user.Role.ToString())
                        {
                            context.Fail("The session has expired or been revoked.");
                        }
                    }
                };
            });
            return services;
        }
    }
}
