using System.Security.Claims;
using AutoMapper;
using FanHub.Application.Interface.ServiceInterface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Authorize(Roles = "Admin"), Route("api/admin")]
    public class AdminAnalyticsController : ApiController
    {
        private readonly IAnalyticsService _analyticsService;

        public AdminAnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("analytics")]
        public Task<object> Analytics(CancellationToken ct)
        {
            return _analyticsService.Analytics(ct);
        }
    }
}
