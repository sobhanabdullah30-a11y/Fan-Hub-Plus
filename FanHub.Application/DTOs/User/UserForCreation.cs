using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.User
{
    public class UserForCreation
    {
        [Required, EmailAddress, MaxLength(254)]
        public string Email { get; set; } = "";

        [Required, MinLength(12), MaxLength(128)]
        public string Password { get; set; } = "";

        [Required, MaxLength(100)]
        public string DisplayName { get; set; } = "";

        public UserForCreation()
        {
        }

        public UserForCreation(string email, string password, string displayName)
        {
            this.Email = email;
            this.Password = password;
            this.DisplayName = displayName;
        }
    }
}
