using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.User
{
    public class SessionResult
    {
        public string AccessToken { get; set; } = "";
        public DateTimeOffset ExpiresAt { get; set; }
        public UserDto User { get; set; } = null!;

        public SessionResult()
        {
        }

        public SessionResult(string accessToken, DateTimeOffset expiresAt, UserDto user)
        {
            this.AccessToken = accessToken;
            this.ExpiresAt = expiresAt;
            this.User = user;
        }
    }
}
