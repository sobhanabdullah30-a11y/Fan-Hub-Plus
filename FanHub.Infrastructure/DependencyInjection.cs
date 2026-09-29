using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Application.MappingProfile.UserProfile;
using FanHub.Domain.DatabaseConfiq;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;
using FanHub.Infrastructure.Configuration;
using FanHub.Infrastructure.Repository;
using FanHub.Infrastructure.Service;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FanHub.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                var connection = config.GetConnectionString("DefaultConnection");
                if (string.IsNullOrWhiteSpace(connection))
                {
                    options.UseSqlServer();
                }
                else
                {
                    options.UseSqlServer(connection, sql => sql.EnableRetryOnFailure());
                }
            });
            services.AddScoped<IRepository, EfRepository>();
            services.AddScoped<IPasswordService, PasswordService>();
            services.AddSingleton<ITokenService, TokenService>();
            services.AddScoped<IAccountMailer, AccountMailer>();
            services.AddScoped<IAccountRepository, AccountRepository>();
            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IEventRepository, EventRepository>();
            services.AddScoped<IEventService, EventService>();
            services.AddScoped<IContentRepository, ContentRepository>();
            services.AddScoped<IContentService, ContentService>();
            services.AddScoped<IDashboardRepository, DashboardRepository>();
            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<IBookmarkRepository, BookmarkRepository>();
            services.AddScoped<IBookmarkService, BookmarkService>();
            services.AddScoped<IRatingRepository, RatingRepository>();
            services.AddScoped<IRatingService, RatingService>();
            services.AddScoped<IFeedbackRepository, FeedbackRepository>();
            services.AddScoped<IFeedbackService, FeedbackService>();
            services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();
            services.AddScoped<IAnalyticsService, AnalyticsService>();
            services.AddScoped<IFaqRepository, FaqRepository>();
            services.AddScoped<IFaqService, FaqService>();
            services.Configure<GeminiOptions>(config.GetSection(GeminiOptions.SectionName));
            services.AddHttpClient<IGenerativeAiService, GeminiChatService>(client =>
            {
                client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
                client.Timeout = TimeSpan.FromSeconds(20);
            });
            services.AddScoped<IChatRepository, ChatRepository>();
            services.AddScoped<IChatService, ChatService>();
            services.AddAutoMapper(mapping =>
            {
                mapping.LicenseKey = config["AutoMapper:LicenseKey"];
                mapping.AddMaps(typeof(UserProfile).Assembly);
            });
            return services;
        }

        public static async Task BootstrapAdmin(IServiceProvider services, IConfiguration config)
        {
            var email = config["BootstrapAdmin:Email"];
            var password = config["BootstrapAdmin:Password"];
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                throw new InvalidOperationException("Set BootstrapAdmin:Email and BootstrapAdmin:Password using environment variables or user secrets.");
            }

            if (password.Length < 12 || password.Length > 128 || !new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(email))
            {
                throw new InvalidOperationException("A valid admin email and 12-128 character password are required.");
            }

            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var normalized = email.Trim().ToLowerInvariant();
            if (await db.Set<User>().AnyAsync(x => x.Role == UserRole.Admin))
            {
                throw new InvalidOperationException("An administrator already exists. Use the admin API to manage access.");
            }

            var user = await db.Set<User>().FirstOrDefaultAsync(x => x.Email == normalized) ?? new User
            {
                Email = normalized,
                DisplayName = "Administrator"
            };
            user.Role = UserRole.Admin;
            user.EmailVerified = true;
            user.IsActive = true;
            user.PasswordHash = scope.ServiceProvider.GetRequiredService<IPasswordService>().Hash(user, password);
            if (db.Entry(user).State == EntityState.Detached)
            {
                db.Add(user);
            }

            await db.SaveChangesAsync();
        }
    }
}
