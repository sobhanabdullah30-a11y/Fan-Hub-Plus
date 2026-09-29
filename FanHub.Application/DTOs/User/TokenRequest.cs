using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.User
{
    public class TokenRequest
    {
        [Required, MaxLength(200)]
        public string Token { get; set; } = "";

        public TokenRequest()
        {
        }

        public TokenRequest(string token)
        {
            this.Token = token;
        }
    }
}
