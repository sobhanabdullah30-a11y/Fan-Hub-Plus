using FanHub.Domain.DatabaseConfiq;
using FanHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FanHub.Domain.DatabaseConfiq.Configurations
{
    public sealed class AccountTokenConfiguration : IEntityTypeConfiguration<AccountToken>
    {
        public void Configure(EntityTypeBuilder<AccountToken> builder)
        {
            builder.HasIndex(x => x.TokenHash).IsUnique();
            builder.Property(x => x.TokenHash).HasMaxLength(EntityConstraints.TokenHashLength);
            builder.Property(x => x.Purpose).HasMaxLength(EntityConstraints.TokenPurposeLength);
            builder.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}
