using FanHub.Api.Configuration;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Domain.DatabaseConfiq;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;
using FanHub.Infrastructure;
using FanHub.Infrastructure.Repository;
using FanHub.Infrastructure.Service;
using FanHub.Tests;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FanHub.Tests
{
    internal static class SqlIntegrationChecks
    {
        public static async Task Run(Action<bool, string> check)
        {
            var connection = Environment.GetEnvironmentVariable("FANHUB_TEST_SQL");
            if (string.IsNullOrWhiteSpace(connection))
            {
                Console.WriteLine("SKIP live SQL checks: set FANHUB_TEST_SQL to a test server connection with database creation permission.");
                return;
            }

            // Always use a new database; never create tables in or delete a configured application database.
            var settings = new SqlConnectionStringBuilder(connection)
            {
                InitialCatalog = "FanHubTests_" + Guid.NewGuid().ToString("N")
            };
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlServer(settings.ConnectionString).Options;
            await using var database = new ApplicationDbContext(options);
            var created = false;
            try
            {
                created = await database.Database.EnsureCreatedAsync();
                if (!created)
                {
                    throw new InvalidOperationException("The isolated SQL test database must be newly created.");
                }

                check(await database.Set<Category>().CountAsync() == 8, "SQL seeds all eight fandom categories");
                var member = new User
                {
                    Email = "sql@example.test",
                    DisplayName = "SQL test member"
                };
                database.Add(member);
                await database.SaveChangesAsync();
                var category = await database.Set<Category>().FirstAsync();
                var mapper = TestConfiguration.CreateMapper();
                var repository = new EfRepository(database);
                var contentRepository = new ContentRepository(repository, new CategoryRepository(repository, mapper), mapper);
                var service = new ContentService(contentRepository);
                var item = await service.Create(member.Id, new ContentForCreation { CategoryId = category.Id, Title = "Database-backed content", Description = "Integration verification", Fandom = "Test", Type = ContentType.Article, Tags = ["Collectible"] }, true, CancellationToken.None);
                var community = new BookmarkService(new BookmarkRepository(repository, contentRepository, mapper));
                await community.SaveBookmark(member.Id, item.Id, "Persisted note", CancellationToken.None);
                await using var reopened = new ApplicationDbContext(options);
                check(await reopened.Set<Bookmark>().AnyAsync(bookmark => bookmark.ContentId == item.Id && bookmark.Note == "Persisted note"), "SQL persists bookmarks across contexts");
                check((await new ContentService(new ContentRepository(new EfRepository(reopened), new CategoryRepository(new EfRepository(reopened), mapper), mapper)).Browse(new ContentFilter { Tag = "Collectible" }, CancellationToken.None)).Total == 1, "SQL executes JSON tag filters");
                var stale = await reopened.Set<Content>().SingleAsync();
                item.Title = "Updated title";
                await database.SaveChangesAsync();
                stale.Title = "Stale title";
                try
                {
                    await new EfRepository(reopened).Save();
                    throw new InvalidOperationException("Expected SQL concurrency conflict.");
                }
                catch (AppException exception)when (exception.Status == 409)
                {
                    check(true, "SQL rowversion rejects stale writes");
                }

                await service.Delete(member.Id, item.Id, true, CancellationToken.None);
                check(!await database.Set<Bookmark>().AnyAsync(), "SQL cascades bookmarks when content is removed");
            }
            finally
            {
                if (created)
                {
                    await database.Database.EnsureDeletedAsync();
                }
            }
        }
    }
}
