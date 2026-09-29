using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Application.DTOs.User
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = "";
        public string DisplayName { get; set; } = "";
        public UserRole Role { get; set; }
        public bool EmailVerified { get; set; }
        public bool IsActive { get; set; }
        public string? AvatarUrl { get; set; }
        public string Theme { get; set; } = "";
        public int FontSize { get; set; }
        public List<string> FavoriteFandoms { get; set; } = [];

        public UserDto()
        {
        }

        public UserDto(
            Guid id,
            string email,
            string displayName,
            UserRole role,
            bool emailVerified,
            bool isActive,
            string? avatarUrl,
            string theme,
            int fontSize,
            List<string> favoriteFandoms)
        {
            this.Id = id;
            this.Email = email;
            this.DisplayName = displayName;
            this.Role = role;
            this.EmailVerified = emailVerified;
            this.IsActive = isActive;
            this.AvatarUrl = avatarUrl;
            this.Theme = theme;
            this.FontSize = fontSize;
            this.FavoriteFandoms = favoriteFandoms;
        }
    }
}
