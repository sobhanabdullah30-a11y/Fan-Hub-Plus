using FanHub.Domain.DatabaseConfiq;
using FanHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FanHub.Domain.DatabaseConfiq.Configurations
{
    public sealed class ContentConfiguration : IEntityTypeConfiguration<Content>
    {
        public void Configure(EntityTypeBuilder<Content> builder)
        {
            builder.Property(x => x.Title).HasMaxLength(EntityConstraints.ContentTitleLength);
            builder.Property(x => x.Fandom).HasMaxLength(EntityConstraints.FandomLength);
            builder.Property(x => x.Genre).HasMaxLength(EntityConstraints.GenreLength);
            builder.Property(x => x.City).HasMaxLength(EntityConstraints.CityLength);
            builder.HasOne<Category>().WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne<User>().WithMany().HasForeignKey(x => x.AuthorId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(x => new { x.Status, x.Type, x.CategoryId });
            builder.HasIndex(x => x.ReleaseDate);
            builder.HasIndex(x => new { x.City, x.StartsAt });
        }
    }
}
