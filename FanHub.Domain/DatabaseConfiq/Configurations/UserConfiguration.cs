using FanHub.Domain.DatabaseConfiq;
using FanHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FanHub.Domain.DatabaseConfiq.Configurations
{
    public sealed class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasIndex(x => x.Email).IsUnique();
            builder.Property(x => x.Email).HasMaxLength(EntityConstraints.EmailLength);
            builder.Property(x => x.DisplayName).HasMaxLength(EntityConstraints.DisplayNameLength);
            builder.Property(x => x.PasswordHash).HasMaxLength(EntityConstraints.PasswordHashLength);
        }
    }
}
