using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.User
{
    public class LoginRequest
    {
        [Required, EmailAddress, MaxLength(254)]
        public string Email { get; set; } = "";

        [Required, MaxLength(128)]
        public string Password { get; set; } = "";

        public LoginRequest()
        {
        }

        public LoginRequest(string email, string password)
        {
            this.Email = email;
            this.Password = password;
        }
    }
}
