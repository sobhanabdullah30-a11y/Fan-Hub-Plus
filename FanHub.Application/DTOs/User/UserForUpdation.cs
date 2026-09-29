using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.User
{
    public class UserForUpdation
    {
        [Required, MaxLength(100)]
        public string DisplayName { get; set; } = "";

        [Required, RegularExpression("^(system|light|dark)$")]
        public string Theme { get; set; } = "";

        [Range(12, 32)]
        public int FontSize { get; set; }

        [Required, MaxLength(30)]
        public List<string> FavoriteFandoms { get; set; } = [];

        [Required, MaxLength(30)]
        public List<Guid> CategoryIds { get; set; } = [];

        [MaxLength(2000)]
        public string? AvatarUrl { get; set; }

        public UserForUpdation()
        {
        }

        public UserForUpdation(
            string displayName,
            string theme,
            int fontSize,
            List<string> favoriteFandoms,
            List<Guid> categoryIds,
            string? avatarUrl)
        {
            this.DisplayName = displayName;
            this.Theme = theme;
            this.FontSize = fontSize;
            this.FavoriteFandoms = favoriteFandoms;
            this.CategoryIds = categoryIds;
            this.AvatarUrl = avatarUrl;
        }
    }
}
