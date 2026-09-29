using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.User
{
    public class ChangePasswordRequest
    {
        [Required]
        public string CurrentPassword { get; set; } = "";

        [Required, MinLength(12), MaxLength(128)]
        public string NewPassword { get; set; } = "";

        public ChangePasswordRequest()
        {
        }

        public ChangePasswordRequest(string currentPassword, string newPassword)
        {
            this.CurrentPassword = currentPassword;
            this.NewPassword = newPassword;
        }
    }
}
