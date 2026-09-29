using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace FanHub.Infrastructure.Service
{
    public sealed class PasswordService : IPasswordService
    {
        private readonly PasswordHasher<User> hasher = new();

        public string Hash(User user, string password)
        {
            return hasher.HashPassword(user, password);
        }

        public bool Verify(User user, string password)
        {
            return hasher.VerifyHashedPassword(user, user.PasswordHash, password) != PasswordVerificationResult.Failed;
        }
    }
}
