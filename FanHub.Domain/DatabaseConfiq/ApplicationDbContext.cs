using FanHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FanHub.Domain.DatabaseConfiq
{
    public sealed class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Session> Sessions => Set<Session>();
        public DbSet<AccountToken> AccountTokens => Set<AccountToken>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Content> Contents => Set<Content>();
        public DbSet<UserInterest> UserInterests => Set<UserInterest>();
        public DbSet<Bookmark> Bookmarks => Set<Bookmark>();
        public DbSet<Rating> Ratings => Set<Rating>();
        public DbSet<Feedback> Feedbacks => Set<Feedback>();
        public DbSet<Activity> Activities => Set<Activity>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
        public DbSet<Faq> Faqs => Set<Faq>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
            modelBuilder.Entity<Faq>();
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(Entity).IsAssignableFrom(entityType.ClrType))
                {
                   
                    modelBuilder.Entity(entityType.ClrType).ToTable(entityType.ClrType.Name);
                    modelBuilder.Entity(entityType.ClrType).Property(nameof(Entity.Version)).IsRowVersion();
                }
            }

            modelBuilder.Entity<Category>().HasData(CategorySeedData.Categories.Select(category => new { category.Id, category.Name, category.Description, category.CreatedAt }));
        }
    }
}
