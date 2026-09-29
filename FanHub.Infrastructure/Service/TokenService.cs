using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using FanHub.Application.Interface.ServiceInterface;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace FanHub.Infrastructure.Service
{
    public sealed class TokenService : ITokenService
    {
        public string Create()
        {
            return Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        }

        public string Hash(string token)
        {
            return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
        }
    }
}
