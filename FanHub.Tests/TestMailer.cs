using FanHub.Api.Configuration;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Infrastructure;
using FanHub.Tests;
using Microsoft.Extensions.Configuration;

namespace FanHub.Tests
{
    public sealed class TestMailer : IAccountMailer
    {
        public Dictionary<(string, string), string> Tokens { get; } = [];
        public bool FailDelivery
        {
            get; set;
        }

        public Task Send(string email, string purpose, string token, CancellationToken ct)
        {
            if (FailDelivery)
            {
                throw new FanHub.Application.Common.AppException(503, "SMTP is unavailable.");
            }

            Tokens[(email, purpose)] = token;
            return Task.CompletedTask;
        }
    }
}
