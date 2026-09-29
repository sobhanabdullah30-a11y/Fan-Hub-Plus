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
    [Authorize(Roles = "Admin"), Route("api/admin")]
    public class AdminContentController : ApiController
    {
        private readonly IContentService _contentService;

        public AdminContentController(IContentService contentService)
        {
            _contentService = contentService;
        }

        [HttpGet("content")]
        public Task<Page<Content>> List(CancellationToken ct, PublicationStatus? status = null, int page = 1, int pageSize = 20)
        {
            return _contentService.Submissions(null, status, page, pageSize, ct);
        }

        [HttpGet("content/{id:guid}")]
        public Task<Content> Get(Guid id, CancellationToken ct)
        {
            return _contentService.Get(id, false, ct);
        }

        [HttpPost("content")]
        public async Task<IActionResult> Create(ContentForCreation request, CancellationToken ct)
        {
            var item = await _contentService.Create(UserId, request, true, ct);
            return Created($"/api/admin/content/{item.Id}", item);
        }

        [HttpPut("content/{id:guid}")]
        public Task<Content> Update(Guid id, ContentForUpdation request, CancellationToken ct)
        {
            return _contentService.Update(UserId, id, request, true, ct);
        }

        [HttpDelete("content/{id:guid}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        {
            await _contentService.Delete(UserId, id, true, ct);
            return NoContent();
        }

        [HttpPut("content/{id:guid}/moderation")]
        public async Task<IActionResult> Moderate(Guid id, ModerationRequest request, CancellationToken ct)
        {
            await _contentService.Moderate(id, request, ct);
            return NoContent();
        }
    }
}
