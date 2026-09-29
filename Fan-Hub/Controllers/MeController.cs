using System.Security.Claims;
using AutoMapper;
using FanHub.Application.DTOs.User;
using FanHub.Application.Interface.ServiceInterface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Authorize, Route("api/me")]
    public class MeController : ApiController
    {
        private readonly IAccountService _accountService;

        public MeController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet]
        public Task<object> Profile(CancellationToken ct)
        {
            return _accountService.Profile(UserId, ct);
        }

        [HttpPut]
        public Task<object> Update(UserForUpdation request, CancellationToken ct)
        {
            return _accountService.UpdateProfile(UserId, request, ct);
        }
    }
}
