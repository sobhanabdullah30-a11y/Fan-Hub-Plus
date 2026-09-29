using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.User
{
    public class EmailRequest
    {
        [Required, EmailAddress]
        public string Email { get; set; } = "";

        public EmailRequest()
        {
        }

        public EmailRequest(string email)
        {
            this.Email = email;
        }
    }
}
