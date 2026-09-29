using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.User
{
    public class ResetPasswordRequest
    {
        [Required]
        public string Token { get; set; } = "";

        [Required, MinLength(12), MaxLength(128)]
        public string Password { get; set; } = "";

        public ResetPasswordRequest()
        {
        }

        public ResetPasswordRequest(string token, string password)
        {
            this.Token = token;
            this.Password = password;
        }
    }
}
