using System.Security.Claims;
using FanHub.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [ApiController]
    [Produces("application/json")]
    public abstract class ApiController : ControllerBase
    {
        protected Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        protected string AccessToken => Request.Headers.Authorization.ToString()["Bearer ".Length..].Trim();
    }
}
