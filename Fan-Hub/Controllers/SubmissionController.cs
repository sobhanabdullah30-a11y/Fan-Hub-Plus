using System.Security.Claims;
using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Authorize, Route("api/me")]
    public class SubmissionController : ApiController
    {
        private readonly IContentService _contentService;

        public SubmissionController(IContentService contentService)
        {
            _contentService = contentService;
        }

        [HttpGet("submissions")]
        public Task<Page<Content>> Submissions(CancellationToken ct, PublicationStatus? status = null, int page = 1, int pageSize = 20)
        {
            return _contentService.Submissions(UserId, status, page, pageSize, ct);
        }

        [HttpPost("submissions")]
        public async Task<IActionResult> Submit(ContentForCreation request, CancellationToken ct)
        {
            var item = await _contentService.Create(UserId, request, false, ct);
            return Created($"/api/me/submissions/{item.Id}", item);
        }

        [HttpGet("submissions/{id:guid}")]
        public async Task<Content> Submission(Guid id, CancellationToken ct)
        {
            var item = await _contentService.Get(id, false, ct);
            if (item.AuthorId != UserId)
            {
                throw new AppException(404, "Submission not found.");
            }

            return item;
        }

        [HttpPut("submissions/{id:guid}")]
        public Task<Content> UpdateSubmission(Guid id, ContentForUpdation request, CancellationToken ct)
        {
            return _contentService.Update(UserId, id, request, false, ct);
        }

        [HttpDelete("submissions/{id:guid}")]
        public async Task<IActionResult> DeleteSubmission(Guid id, CancellationToken ct)
        {
            await _contentService.Delete(UserId, id, false, ct);
            return NoContent();
        }
    }
}
