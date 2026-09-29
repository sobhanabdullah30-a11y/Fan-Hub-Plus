using System.Security.Claims;
using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.User;
using FanHub.Application.Interface.ServiceInterface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Authorize(Roles = "Admin"), Route("api/admin")]
    public class AdminUserController : ApiController
    {
        private readonly IAccountService _accountService;
        private readonly IMapper _mapper;

        public AdminUserController(IAccountService accountService, IMapper mapper)
        {
            _accountService = accountService;
            _mapper = mapper;
        }

        [HttpGet("users/{id:guid}")]
        public async Task<UserDto> UserDetail(Guid id, CancellationToken ct)
        {
            return _mapper.Map<UserDto>(await _accountService.GetUser(id, ct));
        }

        [HttpGet("users")]
        public Task<Page<UserDto>> Users(CancellationToken ct, int page = 1, int pageSize = 20)
        {
            return _accountService.Users(page, pageSize, ct);
        }

        [HttpPut("users/{id:guid}/access")]
        public async Task<IActionResult> Access(Guid id, UserAccessRequest request, CancellationToken ct)
        {
            await _accountService.SetAccess(UserId, id, request, ct);
            return NoContent();
        }

        [HttpDelete("users/{id:guid}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        {
            await _accountService.DeleteAccount(UserId, id, ct);
            return NoContent();
        }
    }
}
