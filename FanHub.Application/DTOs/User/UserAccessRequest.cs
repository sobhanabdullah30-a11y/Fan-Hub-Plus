using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Application.DTOs.User
{
    public class UserAccessRequest
    {
        public UserRole Role { get; set; }
        public bool IsActive { get; set; }

        public UserAccessRequest()
        {
        }

        public UserAccessRequest(UserRole role, bool isActive)
        {
            this.Role = role;
            this.IsActive = isActive;
        }
    }
}
