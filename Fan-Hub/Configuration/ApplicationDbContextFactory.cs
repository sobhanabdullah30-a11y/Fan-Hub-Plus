using FanHub.Domain.DatabaseConfiq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FanHub.Api.Configuration
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var builder = WebApplication.CreateBuilder(new WebApplicationOptions
            {
                Args = args,
                ApplicationName = typeof(ApplicationDbContextFactory).Assembly.FullName,
                ContentRootPath = FindContentRoot()
            });

            var connection = builder.Configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connection))
            {
                throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection in the Fan-Hub startup project before running migrations.");
            }

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(connection, sql => sql.EnableRetryOnFailure())
                .Options;

            return new ApplicationDbContext(options);
        }

        private static string FindContentRoot()
        {
            for (var directory = new DirectoryInfo(Directory.GetCurrentDirectory()); directory != null; directory = directory.Parent)
            {
                if (File.Exists(Path.Combine(directory.FullName, "Fan-Hub.csproj")))
                {
                    return directory.FullName;
                }

                var projectDirectory = Path.Combine(directory.FullName, "Fan-Hub");
                if (File.Exists(Path.Combine(projectDirectory, "Fan-Hub.csproj")))
                {
                    return projectDirectory;
                }
            }

            return AppContext.BaseDirectory;
        }
    }
}
