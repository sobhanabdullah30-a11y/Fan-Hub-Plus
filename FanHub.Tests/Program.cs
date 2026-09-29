using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FanHub.Api.Configuration;
using FanHub.Api.Controllers;
using FanHub.Api.Middleware;
using FanHub.Application.Common;
using FanHub.Application.Configuration;
using FanHub.Application.DTOs.Content;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.DatabaseConfiq;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;
using FanHub.Infrastructure;
using FanHub.Infrastructure.Repository;
using FanHub.Infrastructure.Service;
using FanHub.Tests;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

var checks = 0;
void Check(bool value, string name)
{
    if (!value)
    {
        throw new Exception("FAILED: " + name);
    }

    checks++;
    Console.WriteLine("PASS " + name);
}

async Task Reject(Func<Task> action, int status, string name)
{
    try
    {
        await action();
        throw new Exception("Expected rejection: " + name);
    }
    catch (AppException ex)
    {
        Check(ex.Status == status, name);
    }
}

var ct = CancellationToken.None;
async Task CheckEmailConfiguration(string url, bool allowLoopback, string expectedError, string name)
{
    var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
    {
        ["Email:FrontendUrl"] = url,
        ["Email:AllowLoopbackFrontend"] = allowLoopback.ToString(),
        ["Email:From"] = "sender@example.test",
        ["Email:Host"] = "smtp.example.test",
        ["Email:Username"] = "sender@example.test"
    }).Build();
    try
    {
        await new AccountMailer(config, new TestHostEnvironment()).Send("recipient@example.test", "verify-email", "test-token", ct);
        throw new Exception("Expected email configuration rejection.");
    }
    catch (AppException ex)
    {
        Check(ex.Status == 503 && ex.Message == expectedError, name);
    }
}
await CheckEmailConfiguration("http://localhost:5173", false, "Email frontend URL is not configured.", "production loopback email links require explicit opt-in");
await CheckEmailConfiguration("http://localhost:5173", true, "SMTP is not configured.", "local React email links are accepted with opt-in and missing SMTP password is reported");
await CheckEmailConfiguration("http://example.test", true, "Email frontend URL is not configured.", "loopback opt-in does not allow external HTTP verification links");
await CheckEmailConfiguration("ftp://localhost", true, "Email frontend URL is not configured.", "loopback opt-in does not allow non-HTTP verification links");
var store = new MemoryStore();
var mail = new TestMailer();
var passwords = new PasswordService();
var tokenService = new TokenService();
var testConfiguration = TestConfiguration.Create();
var mapper = TestConfiguration.CreateMapper();
var jwt = new JwtService(testConfiguration.GetSection("Jwt").Get<JwtSettings>()!);
var retryStore = new MemoryStore();
var retryMail = new TestMailer { FailDelivery = true };
var retryAccounts = new AccountService(new AccountRepository(retryStore, passwords, tokenService, retryMail, jwt, mapper));
await Reject(() => retryAccounts.Register(new("retry@example.test", "Retry-Password-123", "Retry member"), ct), 503, "SMTP failure is reported during registration");
retryMail.FailDelivery = false;
await Reject(
    () => retryAccounts.Register(new("retry@example.test", "Different-Password-123", "Replacement"), ct),
    409,
    "registration retry with a different password is rejected"
);
Check(retryMail.Tokens.Count == 0, "registration retry with a different password cannot replace or resend an existing account");
await retryAccounts.Register(new("retry@example.test", "Retry-Password-123", "Replacement"), ct);
Check(retryStore.Query<User>().Count() == 1 && retryStore.Query<User>().Single().DisplayName == "Retry member", "registration retry preserves the original account");
Check(retryMail.Tokens.ContainsKey(("retry@example.test", "verify-email")), "registration retry sends verification after SMTP recovers");
await retryAccounts.VerifyEmail(retryMail.Tokens[("retry@example.test", "verify-email")], ct);
var retryLogin = await retryAccounts.Login(new("retry@example.test", "Retry-Password-123"), ct);
Check(await retryAccounts.Authenticate(retryLogin.AccessToken, ct) != null, "recovered registration can verify and log in");
var categoryRepository = new CategoryRepository(store, mapper);
var contentRepository = new ContentRepository(store, categoryRepository, mapper);
var bookmarkRepository = new BookmarkRepository(store, contentRepository, mapper);
var faqRepository = new FaqRepository(store, mapper);
var accounts = new AccountService(new AccountRepository(store, passwords, tokenService, mail, jwt, mapper));
var content = new ContentService(contentRepository);
var categoryService = new CategoryService(categoryRepository);
var events = new EventService(new EventRepository(store, mapper));
var bookmark = new BookmarkService(bookmarkRepository);
var rating = new RatingService(new RatingRepository(store, contentRepository, mapper));
var feedbackService = new FeedbackService(new FeedbackRepository(store, mapper));
var dashboard = new DashboardService(new DashboardRepository(store, bookmarkRepository, mapper));
var faq = new FaqService(faqRepository);
var chatService = new ChatService(new ChatRepository(store, faqRepository, mapper, new TestGenerativeAi()));
var analytics = new AnalyticsService(new AnalyticsRepository(store, mapper));
await accounts.Register(new("member@example.test", "Correct-Password-123", "Member"), ct);
var member = store.Query<User>().Single();
Check(member.Role == UserRole.Member && !member.EmailVerified, "registration cannot self-promote or self-verify");
Check(!member.PasswordHash.Contains("Correct-Password-123"), "password stored as a hash");
await Reject(() => accounts.Login(new(member.Email, "Correct-Password-123"), ct), 403, "unverified login rejected");
await accounts.VerifyEmail(mail.Tokens[(member.Email, "verify-email")], ct);
await Reject(() => accounts.VerifyEmail(mail.Tokens[(member.Email, "verify-email")], ct), 400, "email token is single-use");
await Reject(() => accounts.Login(new(member.Email, "wrong"), ct), 401, "incorrect password rejected");
var login = await accounts.Login(new(member.Email, "Correct-Password-123"), ct);
Check(await accounts.Authenticate(login.AccessToken, ct) != null, "valid session authenticates");
Check(
    store.Query<Session>().All(session => session.TokenHash != login.AccessToken),
    "session token stored only as hash"
);
await accounts.Logout(login.AccessToken, ct);
Check(await accounts.Authenticate(login.AccessToken, ct) == null, "logout immediately revokes access");
login = await accounts.Login(new(member.Email, "Correct-Password-123"), ct);
await accounts.RequestToken(member.Email, "reset-password", ct);
await accounts.ResetPassword(new(mail.Tokens[(member.Email, "reset-password")], "Changed-Password-456"), ct);
Check(await accounts.Authenticate(login.AccessToken, ct) == null, "password reset revokes all sessions");
await Reject(() => accounts.ResetPassword(new(mail.Tokens[(member.Email, "reset-password")], "Changed-Password-789"), ct), 400, "reset token cannot be replayed");
await Reject(() => accounts.Login(new(member.Email, "Correct-Password-123"), ct), 401, "old password no longer works");
login = await accounts.Login(new(member.Email, "Changed-Password-456"), ct);
var category = await categoryService.SaveCategory(null, new("Anime", "Animated stories"), ct);
await Reject(() => categoryService.SaveCategory(null, new("Anime", "Duplicate"), ct), 409, "duplicate categories rejected");
ContentForCreation Request(string title, ContentType type = ContentType.Article) => new()
{
    CategoryId = category.Id,
    Title = title,
    Description = "A useful description",
    Fandom = "Test Fandom",
    Type = type,
    MediaUrl = type == ContentType.Video ? "https://example.test/video" : null
};
var submission = await content.Create(member.Id, Request("Fan article"), false, ct);
Check(submission.Status == PublicationStatus.Pending, "fan submissions require moderation");
Check((await content.Browse(new(), ct)).Total == 0, "pending content is hidden from public browse");
await Reject(() => content.Detail(submission.Id, ct), 404, "pending detail is hidden");
await Reject(() => bookmark.SaveBookmark(member.Id, submission.Id, "", ct), 404, "pending content cannot be bookmarked");
await Reject(() => content.Update(Guid.NewGuid(), submission.Id, Request("Hacked"), false, ct), 404, "members cannot edit another user's submission");
await content.Moderate(submission.Id, new(true, null), ct);
Check((await content.Browse(new() { Search = "Fan", CategoryId = category.Id }, ct)).Total == 1, "search and category filters compose");
await bookmark.SaveBookmark(member.Id, submission.Id, "first note", ct);
await bookmark.SaveBookmark(member.Id, submission.Id, "updated note", ct);
Check(store.Query<Bookmark>().Count() == 1 && store.Query<Bookmark>().Single().Note == "updated note", "bookmark PUT is idempotent and updates notes");
Check((await bookmark.Bookmarks(Guid.NewGuid(), 1, 20, ct)).Total == 0, "bookmarks isolated by user");
await content.Update(member.Id, submission.Id, Request("Edited article"), false, ct);
Check(submission.Status == PublicationStatus.Pending, "member edits require reapproval");
Check((await bookmark.Bookmarks(member.Id, 1, 20, ct)).Total == 0, "unpublished bookmarked content is hidden");
await content.Moderate(submission.Id, new(true, null), ct);
await Reject(() => categoryService.DeleteCategory(category.Id, ct), 409, "referenced category cannot be deleted");
await rating.Rate(member.Id, submission.Id, new(5, ""), ct);
Check(store.Query<Rating>().Single().ContentId == submission.Id, "published catalog content can be rated");
await rating.RemoveRating(member.Id, submission.Id, ct);
var video = await content.Create(member.Id, Request("Trailer", ContentType.Video), true, ct);
await rating.Rate(member.Id, video.Id, new(3, "Fine"), ct);
await rating.Rate(member.Id, video.Id, new(5, "Great"), ct);
Check(store.Query<Rating>().Count() == 1 && store.Query<Rating>().Single().Stars == 5, "one rating per user and content item");
var unsafeMedia = Request("Unsafe", ContentType.Video);
unsafeMedia.MediaUrl = "javascript:alert(1)";
await Reject(() => content.Create(member.Id, unsafeMedia, true, ct), 400, "unsafe media URL rejected");
await Reject(() => accounts.UpdateProfile(member.Id, new("Member", "dark", 16, [], [Guid.NewGuid()], null), ct), 400, "profile rejects unknown categories");
await accounts.UpdateProfile(member.Id, new("Member", "dark", 18, ["Test Fandom"], [category.Id], null), ct);
Check(member.Theme == "dark" && store.Query<UserInterest>().Count() == 1, "profile preferences saved");
var eventRequest = Request("Convention", ContentType.Event);
eventRequest.City = "Karachi";
eventRequest.StartsAt = DateTimeOffset.UtcNow.AddDays(1);
eventRequest.EndsAt = eventRequest.StartsAt.Value.AddHours(3);
eventRequest.Latitude = 24.8607;
eventRequest.Longitude = 67.0011;
var evt = await content.Create(member.Id, eventRequest, true, ct);
Check((await events.Events(new() { Latitude = 24.8607, Longitude = 67.0011, RadiusKm = 10 }, ct)).Total == 1, "nearby event included");
Check((await events.Events(new() { Latitude = 31.5204, Longitude = 74.3587, RadiusKm = 10 }, ct)).Total == 0, "distant event excluded");
await Reject(() => events.Events(new() { Latitude = 24 }, ct), 400, "partial coordinates rejected");
var feedback = await feedbackService.Feedback(member.Id, new(FeedbackType.Bug, "An issue"), ct);
await feedbackService.UpdateFeedback(feedback.Id, new(FeedbackStatus.Resolved, "Fixed"), ct);
Check(feedback.Status == FeedbackStatus.Resolved, "feedback moderation works");
await faq.SaveFaq(null, new("How to bookmark?", "Use the bookmark button.", true), ct);
var chat = await chatService.Chat(member.Id, new(null, "bookmark"), ct);
Check(chat.Response == "Use the bookmark button.", "FAQ assistant retrieves approved answer");
await Reject(() => chatService.Chat(Guid.NewGuid(), new(chat.ConversationId, "continue"), ct), 404, "chat conversation ownership enforced");
var admin = new User
{
    Email = "admin@example.test",
    DisplayName = "Admin",
    Role = UserRole.Admin,
    EmailVerified = true
};
admin.PasswordHash = passwords.Hash(admin, "Admin-Password-123");
store.Add(admin);
await Reject(() => accounts.SetAccess(admin.Id, admin.Id, new(UserRole.Member, false), ct), 400, "admin cannot revoke own access");
await accounts.SetAccess(admin.Id, member.Id, new(UserRole.Member, false), ct);
Check(await accounts.Authenticate(login.AccessToken, ct) == null, "disabled account loses access");
await accounts.SetAccess(admin.Id, member.Id, new(UserRole.Member, true), ct);
// Requirements coverage checks for discovery, event detail and account activity.
var biography = Request("Character profile", ContentType.Character);
biography.Body = "A unique biography keyword: starlight";
biography.Genre = "Adventure";
var character = await content.Create(admin.Id, biography, true, ct);
Check((await content.Browse(new() { Search = "starlight" }, ct)).Items.Any(item => item.Id == character.Id), "search includes character biographies and article body");
Check((await content.Browse(new() { Search = "Adventure" }, ct)).Items.Any(item => item.Id == character.Id), "search includes genre");
var scoped = await content.Browse(new() { Types = [ContentType.Character], PageSize = 1 }, ct);
Check(scoped.Items.Count == 1 && scoped.Items.All(x => x.Type == ContentType.Character), "content type scopes run before server pagination");
await bookmark.SaveBookmark(member.Id, character.Id, "Private character note", ct);
Check((await bookmark.Bookmarks(member.Id, 1, 12, ct, new() { Search = "starlight" })).Total == 1, "collection search includes biographies before pagination");
Check((await bookmark.Bookmarks(member.Id, 1, 100, ct, new() { ContentIds = [character.Id] })).Total == 1, "visible-content bookmark lookup returns the saved record");
Check((await bookmark.Bookmarks(admin.Id, 1, 100, ct, new() { ContentIds = [character.Id] })).Total == 0, "visible-content bookmark lookup remains private");
var releaseRequest = Request("Future release", ContentType.Release);
releaseRequest.ReleaseDate = DateTimeOffset.UtcNow.AddDays(7);
var futureRelease = await content.Create(admin.Id, releaseRequest, true, ct);
releaseRequest.Title = "Past release";
releaseRequest.ReleaseDate = DateTimeOffset.UtcNow.AddDays(-7);
var pastRelease = await content.Create(admin.Id, releaseRequest, true, ct);
var upcoming = await content.Browse(new() { Type = ContentType.Release, Upcoming = true, Sort = "upcoming" }, ct);
Check(upcoming.Items.Any(x => x.Id == futureRelease.Id) && upcoming.Items.All(x => x.Id != pastRelease.Id), "upcoming catalog excludes past releases");
var memberActivity = await dashboard.RecentActivity(member.Id, 1, 2, ct);
Check(memberActivity.Items.Count <= 2 && memberActivity.Items.All(item => item.UserId == member.Id), "recent activity is paginated and private");
Check((await dashboard.RecentActivity(Guid.NewGuid(), 1, 20, ct)).Total == 0, "another account cannot read member activity");
await Reject(() => dashboard.RecentActivity(member.Id, 0, 20, ct), 400, "activity rejects invalid pagination");
var eventsController = new EventsController(events, content);
Check((await eventsController.Detail(evt.Id, ct)).Id == evt.Id, "event detail returns a published event");
await Reject(() => eventsController.Detail(video.Id, ct), 404, "event detail excludes non-event content");
await Reject(() => feedbackService.GetFeedback(Guid.NewGuid(), ct), 404, "unknown feedback returns not found");
// SQL model and translation checks use the real provider without opening a database.
using (var sql = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlServer("Server=localhost;Database=FanHub;Trusted_Connection=True;TrustServerCertificate=True").Options))
{
    var schema = sql.Database.GenerateCreateScript();
    Check(schema.Contains("FOREIGN KEY") && schema.Contains("rowversion") && schema.Contains("CK_Rating_Stars"), "SQL schema contains relationships, concurrency tokens and rating constraint");
    Check(schema.Contains("Cosplay") && schema.Contains("Anime"), "SQL script includes category seed data");
    Check(sql.Set<Content>().Where(x => x.Tags.Contains("Limited Edition")).ToQueryString().Contains("OPENJSON"), "tag filter translates to SQL JSON query");
    var lat = 24.86;
    var lon = 67.0;
    var rad = Math.PI / 180;
    var geo = sql.Set<Content>().Where(x => x.Latitude != null && x.Longitude != null && 12742 * Math.Asin(Math.Sqrt(Math.Pow(Math.Sin((x.Latitude.Value - lat) * rad / 2), 2) + Math.Cos(lat * rad) * Math.Cos(x.Latitude.Value * rad) * Math.Pow(Math.Sin((x.Longitude.Value - lon) * rad / 2), 2))) <= 50).ToQueryString();
    Check(geo.Contains("ASIN") && geo.Contains("SIN"), "nearby filter translates to SQL trigonometry");
}

// Exercise real MVC routing, validation and role authorization against a test-only store.
var builder = WebApplication.CreateBuilder();
builder.Logging.ClearProviders();
builder.WebHost.UseUrls("http://127.0.0.1:0");
builder.Configuration.AddConfiguration(testConfiguration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddSingleton<IRepository>(store);
builder.Services.AddSingleton<IAccountMailer>(mail);
builder.Services.AddFanHubJwt(builder.Configuration, false);
builder.Services.AddFrontendCors(builder.Configuration);
builder.Services.AddControllers().AddApplicationPart(typeof(AuthController).Assembly).AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(allowIntegerValues: false)));
builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(o => o.AddFixedWindowLimiter("auth", p =>
{
    p.PermitLimit = 10000;
    p.Window = TimeSpan.FromMinutes(1);
}));
await using var app = builder.Build();
app.UseMiddleware<FanHub.Api.Middleware.ExceptionHandlingMiddleware>();
app.UseCors(CorsConfiguration.FrontendPolicy);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
await app.StartAsync();
var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.Single();
using var http = new HttpClient
{
    BaseAddress = new Uri(address)
};
Check((await http.GetAsync("/api/me")).StatusCode == HttpStatusCode.Unauthorized, "anonymous profile access returns 401");
Check((await http.GetAsync("/api/admin/users")).StatusCode == HttpStatusCode.Unauthorized, "anonymous admin access returns 401");
var memberLogin = await accounts.Login(new(member.Email, "Changed-Password-456"), ct);
http.DefaultRequestHeaders.Authorization = new("Bearer", memberLogin.AccessToken);
Check((await http.GetAsync("/api/admin/users")).StatusCode == HttpStatusCode.Forbidden, "member admin access returns 403");
Check((await http.GetAsync("/api/me")).StatusCode == HttpStatusCode.OK, "authenticated profile accessible");
Check((await http.GetAsync("/api/content?pageSize=101")).StatusCode == HttpStatusCode.BadRequest, "pagination validation returns 400");
Check((await http.PutAsJsonAsync($"/api/content/{video.Id}/rating", new { stars = 8, comment = "bad" })).StatusCode == HttpStatusCode.BadRequest, "invalid rating rejected by MVC");
Check((await http.PostAsJsonAsync("/api/me/submissions", new { title = "", type = "Article" })).StatusCode == HttpStatusCode.BadRequest, "invalid submission rejected by MVC");
Check((await http.PostAsJsonAsync("/api/me/feedback", new { type = 99, message = "bad" })).StatusCode == HttpStatusCode.BadRequest, "numeric enum values rejected");
Check((await http.GetStringAsync($"/api/events/{evt.Id}/calendar")).Contains("BEGIN:VEVENT"), "event calendar endpoint exports iCalendar");
var adminLogin = await accounts.Login(new(admin.Email, "Admin-Password-123"), ct);
http.DefaultRequestHeaders.Authorization = new("Bearer", adminLogin.AccessToken);
Check((await http.GetAsync("/api/admin/users")).StatusCode == HttpStatusCode.OK, "admin can list users");

var updateResponse = await http.PutAsJsonAsync($"/api/admin/content/{video.Id}", new
{
    categoryId = category.Id,
    title = "Updated trailer",
    description = "Updated through the update DTO",
    fandom = "Test Fandom",
    type = "Video",
    mediaUrl = "https://example.test/updated-video"
});
Check(updateResponse.StatusCode == HttpStatusCode.OK && store.Query<Content>().Single(item => item.Id == video.Id).Title == "Updated trailer", "update DTO inherits validation and maps correctly through the controller-service-repository chain");

var userJson = await http.GetStringAsync("/api/admin/users");
Check(!userJson.Contains("passwordHash", StringComparison.OrdinalIgnoreCase), "user API excludes password hashes");
Check((await http.GetAsync($"/api/admin/users/{member.Id}")).StatusCode == HttpStatusCode.OK, "admin can view user details");
var detailJson = await http.GetStringAsync($"/api/admin/users/{member.Id}");
Check(!detailJson.Contains("passwordHash", StringComparison.OrdinalIgnoreCase), "user detail excludes credentials");
var feedbackResponse = await http.PostAsJsonAsync("/api/admin/feedback", new { type = "Suggestion", message = "Improve category navigation" });
Check(feedbackResponse.StatusCode == HttpStatusCode.Created && feedbackResponse.Headers.Location != null, "admin can create feedback with a resource location");
Check((await http.GetAsync(feedbackResponse.Headers.Location)).StatusCode == HttpStatusCode.OK, "admin feedback resource location resolves");
http.DefaultRequestHeaders.Authorization = new("Bearer", memberLogin.AccessToken);
Check((await http.PostAsJsonAsync("/api/admin/feedback", new { type = "Bug", message = "Denied" })).StatusCode == HttpStatusCode.Forbidden, "members cannot create administrative feedback");
Check((await http.GetAsync($"/api/admin/feedback/{feedback.Id}")).StatusCode == HttpStatusCode.Forbidden, "members cannot inspect administrative feedback");
Check((await http.GetAsync("/api/me/activity")).StatusCode == HttpStatusCode.OK, "member activity endpoint is accessible");
Check((await http.GetAsync("/api/me/activity?pageSize=101")).StatusCode == HttpStatusCode.BadRequest, "activity endpoint rejects oversized pages");
http.DefaultRequestHeaders.Authorization = null;
Check((await http.GetAsync("/api/me/activity")).StatusCode == HttpStatusCode.Unauthorized, "anonymous activity access is rejected");
Check((await http.GetAsync($"/api/events/{evt.Id}")).StatusCode == HttpStatusCode.OK, "published event details are public");
Check((await http.GetAsync($"/api/events/{video.Id}")).StatusCode == HttpStatusCode.NotFound, "event route returns 404 for other content types");
Check(login.AccessToken.Split('.').Length == 3, "login returns a signed JWT");
Check(await jwt.ValidateTokenAsync(memberLogin.AccessToken) != null, "JWT validates signature and claims");
Check(await jwt.ValidateTokenAsync(jwt.GenerateToken(member, DateTimeOffset.UtcNow.AddMinutes(-1))) == null, "expired JWT rejected");
var foreignSettings = testConfiguration.GetSection("Jwt").Get<JwtSettings>()!;
foreignSettings.Issuer = "different-issuer";
var foreignJwt = new JwtService(foreignSettings).GenerateToken(member, DateTimeOffset.UtcNow.AddMinutes(5));
Check(await jwt.ValidateTokenAsync(foreignJwt) == null, "wrong JWT issuer rejected");
foreignSettings = testConfiguration.GetSection("Jwt").Get<JwtSettings>()!;
foreignSettings.Audience = "different-audience";
Check(await jwt.ValidateTokenAsync(new JwtService(foreignSettings).GenerateToken(member, DateTimeOffset.UtcNow.AddMinutes(5))) == null, "wrong JWT audience rejected");
foreignSettings = TestConfiguration.Create().GetSection("Jwt").Get<JwtSettings>()!;
var wrongKeyToken = new JwtService(foreignSettings).GenerateToken(member, DateTimeOffset.UtcNow.AddMinutes(5));
Check(await jwt.ValidateTokenAsync(wrongKeyToken) == null, "JWT signed with another key rejected");
http.DefaultRequestHeaders.Authorization = new("Bearer", wrongKeyToken);
Check((await http.GetAsync("/api/me")).StatusCode == HttpStatusCode.Unauthorized, "JWT bearer handler rejects an invalid signature");
http.DefaultRequestHeaders.Authorization = new("Bearer", memberLogin.AccessToken);
Check((await http.PostAsync("/api/auth/logout", null)).StatusCode == HttpStatusCode.NoContent, "JWT logout endpoint succeeds");
Check((await http.GetAsync("/api/me")).StatusCode == HttpStatusCode.Unauthorized, "revoked JWT is rejected by the bearer handler");
http.DefaultRequestHeaders.Authorization = null;
using (var preflight = new HttpRequestMessage(HttpMethod.Options, "/api/content"))
{
    preflight.Headers.Add("Origin", "https://frontend.example.test");
    preflight.Headers.Add("Access-Control-Request-Method", "GET");
    preflight.Headers.Add("Access-Control-Request-Headers", "authorization");
    var response = await http.SendAsync(preflight);
    Check(response.Headers.TryGetValues("Access-Control-Allow-Origin", out var origins) && origins.Single() == "https://frontend.example.test", "named CORS policy permits the configured frontend");
}

using (var preflight = new HttpRequestMessage(HttpMethod.Options, "/api/content"))
{
    preflight.Headers.Add("Origin", "https://untrusted.example.test");
    preflight.Headers.Add("Access-Control-Request-Method", "GET");
    var response = await http.SendAsync(preflight);
    Check(!response.Headers.Contains("Access-Control-Allow-Origin"), "CORS policy does not allow an unconfigured origin");
}

ArchitectureChecks.Run(Check, app.Environment);
await SqlIntegrationChecks.Run(Check);
await app.StopAsync();
Console.WriteLine($"SUCCESS: {checks} checks passed.");
