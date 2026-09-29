using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FanHub.Api.Configuration;
using FanHub.Api.Middleware;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Application.MappingProfile.UserProfile;
using FanHub.Domain.DatabaseConfiq;
using FanHub.Domain.Entities;
using FanHub.Infrastructure;
using FanHub.Infrastructure.Configuration;
using FanHub.Infrastructure.Repository;
using FanHub.Infrastructure.Service;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers().AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(allowIntegerValues: false)));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new OpenApiInfo { Title = "Fan Hub Plus API", Version = "v1", Description = "Onion architecture API. Use the JWT accessToken returned by login as a Bearer token. All content types share /api/admin/content management routes." });
    o.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme { Type = SecuritySchemeType.Http, Scheme = "bearer", BearerFormat = "JWT", Description = "Paste the accessToken from POST /api/auth/login." });
    o.AddSecurityRequirement(new OpenApiSecurityRequirement { { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }, Array.Empty<string>() } });
});
// Database and feature dependencies follow the reference project's startup layout.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connection = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connection))
    {
        options.UseSqlServer();
    }
    else
    {
        options.UseSqlServer(connection, sql => sql.EnableRetryOnFailure());
    }
});
builder.Services.AddScoped<IRepository, EfRepository>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddSingleton<ITokenService, TokenService>();
builder.Services.AddScoped<IAccountMailer, AccountMailer>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IContentRepository, ContentRepository>();
builder.Services.AddScoped<IContentService, ContentService>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IBookmarkRepository, BookmarkRepository>();
builder.Services.AddScoped<IBookmarkService, BookmarkService>();
builder.Services.AddScoped<IRatingRepository, RatingRepository>();
builder.Services.AddScoped<IRatingService, RatingService>();
builder.Services.AddScoped<IFeedbackRepository, FeedbackRepository>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IFaqRepository, FaqRepository>();
builder.Services.AddScoped<IFaqService, FaqService>();
builder.Services.Configure<GeminiOptions>(builder.Configuration.GetSection(GeminiOptions.SectionName));
builder.Services.AddHttpClient<IGenerativeAiService, GeminiChatService>(client =>
{
    client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
    client.Timeout = TimeSpan.FromSeconds(20);
});
builder.Services.AddScoped<IChatRepository, ChatRepository>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddAutoMapper(mapping =>
{
    mapping.LicenseKey = builder.Configuration["AutoMapper:LicenseKey"];
    mapping.AddMaps(typeof(UserProfile).Assembly);
});
builder.Services.AddFanHubJwt(builder.Configuration, builder.Environment.IsDevelopment());
builder.Services.AddAuthorization();
builder.Services.AddProblemDetails();
builder.Services.AddFrontendCors(builder.Configuration);
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = 429;
    o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx => RateLimitPartition.GetFixedWindowLimiter(ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions { PermitLimit = 120, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    o.AddPolicy("auth", ctx => RateLimitPartition.GetFixedWindowLimiter(ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions { PermitLimit = 15, Window = TimeSpan.FromMinutes(15), QueueLimit = 0 }));
});
var app = builder.Build();
if (args.Contains("--write-schema"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var output = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "..", "database", "001-initial.sql"));
    Directory.CreateDirectory(Path.GetDirectoryName(output)!);
    await File.WriteAllTextAsync(output, db.Database.GenerateCreateScript());
    Console.WriteLine("Schema written to " + output);
    return;
}

if (args.Contains("--bootstrap-admin"))
{
    await DependencyInjection.BootstrapAdmin(app.Services, builder.Configuration);
    Console.WriteLine("Administrator created.");
    return;
}

app.UseMiddleware<FanHub.Api.Middleware.ExceptionHandlingMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.Use(async (context, next) =>
{
    var isAppShell = context.Request.Path == "/" || context.Request.Path.Equals("/index.html", StringComparison.OrdinalIgnoreCase);
    var isCatalogArtwork = context.Request.Path.StartsWithSegments("/catalog");
    if (isAppShell || isCatalogArtwork)
    {
        context.Response.Headers.CacheControl = "no-store, max-age=0, must-revalidate";
        context.Response.Headers.Pragma = "no-cache";
    }

    await next();
});
app.UseDefaultFiles();
var contentTypes = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
contentTypes.Mappings[".vtt"] = "text/vtt";
app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = contentTypes,
    OnPrepareResponse = context =>
    {
        var isAppShell = string.Equals(context.File.Name, "index.html", StringComparison.OrdinalIgnoreCase);
        var isCatalogArtwork = context.Context.Request.Path.StartsWithSegments("/catalog");
        if (isAppShell || isCatalogArtwork)
        {
            context.Context.Response.Headers.CacheControl = "no-store, max-age=0, must-revalidate";
            context.Context.Response.Headers.Pragma = "no-cache";
        }
    }
});
app.UseCors(CorsConfiguration.FrontendPolicy);
app.UseRateLimiter();
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
    if (ctx.Request.Path.StartsWithSegments("/api"))
    {
        ctx.Response.Headers.CacheControl = "no-store";
    }

    if (ctx.Request.Path.StartsWithSegments("/api") && string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString("DefaultConnection")))
    {
        ctx.Response.StatusCode = 503;
        await ctx.Response.WriteAsJsonAsync(new ProblemDetails { Status = 503, Title = "Database is not configured. Set ConnectionStrings:DefaultConnection." });
        return;
    }

    await next();
});
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallback("/api/{**path}", () => Results.NotFound());
app.MapFallback("/health/{**path}", () => Results.NotFound());
app.MapFallbackToFile("index.html");
app.MapGet("/health/live", () => Results.Ok(new { Status = "healthy" }));
app.MapGet("/health/ready", async (ApplicationDbContext db, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString("DefaultConnection")))
    {
        return Results.Problem("Database is not configured.", statusCode: 503);
    }

    try
    {
        if (!await db.Database.CanConnectAsync(ct))
        {
            return Results.Problem("Database unavailable.", statusCode: 503);
        }

        await db.Set<Category>().AnyAsync(ct);
        return Results.Ok(new { Status = "ready" });
    }
    catch
    {
        return Results.Problem("Database or schema unavailable.", statusCode: 503);
    }
});
app.Run();
public partial class Program;
