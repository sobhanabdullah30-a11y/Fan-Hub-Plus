namespace FanHub.Api.Configuration
{
    public static class CorsConfiguration
    {
        public const string FrontendPolicy = "Frontend";
        public static IServiceCollection AddFrontendCors(this IServiceCollection services, IConfiguration configuration)
        {
            var origins = configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
            services.AddCors(options => options.AddPolicy(FrontendPolicy, policy =>
            {
                if (origins.Length > 0)
                {
                    policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
                }
            }));
            return services;
        }
    }
}
