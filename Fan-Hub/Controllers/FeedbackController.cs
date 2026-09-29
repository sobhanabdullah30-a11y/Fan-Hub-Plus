using System.Security.Claims;
using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Feedback;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Authorize, Route("api/me")]
    public class FeedbackController : ApiController
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        [HttpGet("feedback")]
        public Task<Page<Feedback>> Feedback(CancellationToken ct, int page = 1, int pageSize = 20)
        {
            return _feedbackService.FeedbackList(UserId, null, true, page, pageSize, ct);
        }

        [HttpPost("feedback")]
        public async Task<IActionResult> SendFeedback(FeedbackForCreation request, CancellationToken ct)
        {
            var item = await _feedbackService.Feedback(UserId, request, ct);
            return StatusCode(201, item);
        }
    }
}
