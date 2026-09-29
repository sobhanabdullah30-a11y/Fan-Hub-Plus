using AutoMapper;
using FanHub.Application.DTOs.User;
using FanHub.Application.Interface.ServiceInterface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FanHub.Api.Controllers
{
    [Route("api/auth")]
    [EnableRateLimiting("auth")]
    public sealed class AuthController : ApiController
    {
        private readonly IAccountService _accountService;

        public AuthController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserForCreation request, CancellationToken ct)
        {
            await _accountService.Register(request, ct);
            return Accepted(new { Message = "If registration is eligible, a verification email has been sent." });
        }

        [HttpPost("login")]
        public Task<SessionResult> Login(LoginRequest request, CancellationToken ct)
        {
            return _accountService.Login(request, ct);
        }

        [HttpPost("verify-email")]
        public Task<SessionResult> Verify(TokenRequest request, CancellationToken ct)
        {
            return _accountService.VerifyEmail(request.Token, ct);
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> Resend(EmailRequest request, CancellationToken ct)
        {
            await _accountService.RequestToken(request.Email, "verify-email", ct);
            return Accepted(new { Message = "If eligible, a verification email has been sent." });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> Forgot(EmailRequest request, CancellationToken ct)
        {
            await _accountService.RequestToken(request.Email, "reset-password", ct);
            return Accepted(new { Message = "If eligible, password reset instructions have been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> Reset(ResetPasswordRequest request, CancellationToken ct)
        {
            await _accountService.ResetPassword(request, ct);
            return NoContent();
        }

        [Authorize, HttpPost("logout")]
        public async Task<IActionResult> Logout(CancellationToken ct)
        {
            await _accountService.Logout(AccessToken, ct);
            return NoContent();
        }

        [Authorize, HttpPost("change-password")]
        public async Task<IActionResult> Change(ChangePasswordRequest request, CancellationToken ct)
        {
            await _accountService.ChangePassword(UserId, request, ct);
            return NoContent();
        }
    }
}
