using System.Security.Claims;
using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Authorize, Route("api/me")]
    public class DashboardController : ApiController
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("activity")]
        public Task<Page<Activity>> Activity(CancellationToken ct, int page = 1, int pageSize = 20)
        {
            return _dashboardService.RecentActivity(UserId, page, pageSize, ct);
        }

        [HttpGet("dashboard")]
        public Task<object> Dashboard(CancellationToken ct)
        {
            return _dashboardService.Dashboard(UserId, ct);
        }
    }
}
