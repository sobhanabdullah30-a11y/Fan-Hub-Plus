using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using FanHub.Application.Common;
using FanHub.Application.Interface.ServiceInterface;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace FanHub.Infrastructure.Service
{
    public sealed class AccountMailer : IAccountMailer
    {
        private readonly IConfiguration _config;
        private readonly IHostEnvironment _environment;

        public AccountMailer(IConfiguration config, IHostEnvironment environment)
        {
            _config = config;
            _environment = environment;
        }

        public async Task Send(string email, string purpose, string token, CancellationToken cancellationToken)
        {
            var baseUrl = _config["Email:FrontendUrl"];
            var allowLoopback = _environment.IsDevelopment() || _config.GetValue<bool>("Email:AllowLoopbackFrontend");
            if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out var url) ||
                (url.Scheme != "https" && !(allowLoopback && url.Scheme == "http" && url.IsLoopback)))
            {
                throw new AppException(503, "Email frontend URL is not configured.");
            }

            var link = baseUrl!.TrimEnd('/') + "/" + purpose + "?token=" + Uri.EscapeDataString(token);
            using var message = new MailMessage(_config["Email:From"] ?? "noreply@localhost", email, purpose == "verify-email" ? "Verify your Fan Hub Plus email" : "Reset your Fan Hub Plus password", $"Open this link: {link}\nIf you did not request this, ignore this email.");
            using var smtp = new SmtpClient();
            if (_environment.IsDevelopment() && _config.GetValue<bool>("Email:UseDevelopmentPickup"))
            {
                var directory = Path.Combine(_environment.ContentRootPath, "App_Data", "mail");
                Directory.CreateDirectory(directory);
                smtp.DeliveryMethod = SmtpDeliveryMethod.SpecifiedPickupDirectory;
                smtp.PickupDirectoryLocation = directory;
            }
            else
            {
                var host = _config["Email:Host"];
                if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(_config["Email:Username"]) ||
                    string.IsNullOrWhiteSpace(_config["Email:Password"]))
                {
                    throw new AppException(503, "SMTP is not configured.");
                }

                smtp.Host = host;
                smtp.Port = _config.GetValue("Email:Port", 587);
                smtp.EnableSsl = true;
                smtp.Credentials = new NetworkCredential(_config["Email:Username"], _config["Email:Password"]);
            }

            try
            {
                await smtp.SendMailAsync(message, cancellationToken);
            }
            catch (SmtpException)
            {
                throw new AppException(503, "Email could not be delivered. Please retry the verification or reset request.");
            }
        }
    }
}
