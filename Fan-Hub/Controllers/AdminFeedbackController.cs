using System.Security.Claims;
using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Feedback;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Authorize(Roles = "Admin"), Route("api/admin")]
    public class AdminFeedbackController : ApiController
    {
        private readonly IFeedbackService _feedbackService;

        public AdminFeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        [HttpPost("feedback")]
        public async Task<IActionResult> CreateFeedback(FeedbackForCreation request, CancellationToken ct)
        {
            var feedback = await _feedbackService.Feedback(UserId, request, ct);
            return Created($"/api/admin/feedback/{feedback.Id}", feedback);
        }

        [HttpGet("feedback/{id:guid}")]
        public Task<Feedback> FeedbackDetail(Guid id, CancellationToken ct)
        {
            return _feedbackService.GetFeedback(id, ct);
        }

        [HttpGet("feedback")]
        public Task<Page<Feedback>> Feedback(CancellationToken ct, FeedbackStatus? status = null, int page = 1, int pageSize = 20)
        {
            return _feedbackService.FeedbackList(null, status, false, page, pageSize, ct);
        }

        [HttpPut("feedback/{id:guid}")]
        public async Task<IActionResult> UpdateFeedback(Guid id, FeedbackForUpdation request, CancellationToken ct)
        {
            await _feedbackService.UpdateFeedback(id, request, ct);
            return NoContent();
        }

        [HttpDelete("feedback/{id:guid}")]
        public async Task<IActionResult> DeleteFeedback(Guid id, CancellationToken ct)
        {
            await _feedbackService.DeleteFeedback(id, ct);
            return NoContent();
        }
    }
}
