using FanHub.Domain.Enums;

namespace FanHub.Domain.Entities
{
    public class User : Entity
    {
        public string Email { get; set; } = "";
        public string DisplayName { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public UserRole Role { get; set; }
        public bool EmailVerified { get; set; }
        public bool IsActive { get; set; } = true;
        public string? AvatarUrl { get; set; }
        public string Theme { get; set; } = "system";
        public int FontSize { get; set; } = 16;
        public List<string> FavoriteFandoms { get; set; } = [];
        public DateTimeOffset? LastActiveAt { get; set; }
    }
}
