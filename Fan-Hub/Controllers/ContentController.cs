using System.Security.Claims;
using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Route("api/content")]
    public class ContentController : ApiController
    {
        private readonly IContentService _contentService;
        private readonly IConfiguration _configuration;

        public ContentController(IContentService contentService, IConfiguration configuration)
        {
            _contentService = contentService;
            _configuration = configuration;
        }

        [HttpGet]
        public Task<Page<ContentDto>> Browse([FromQuery] ContentFilter filter, CancellationToken ct)
        {
            return _contentService.Browse(filter, ct);
        }

        [HttpGet("filters")]
        public Task<object> Filters(CancellationToken ct)
        {
            return _contentService.Filters(ct);
        }

        [HttpGet("{id:guid}")]
        public Task<ContentDto> Detail(Guid id, CancellationToken ct)
        {
            return _contentService.Detail(id, ct);
        }

        [HttpPost("{id:guid}/views")]
        public async Task<IActionResult> View(Guid id, CancellationToken ct)
        {
            await _contentService.RecordView(id, Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) ? userId : null, ct);
            return NoContent();
        }

        [HttpGet("{id:guid}/share")]
        public async Task<object> Share(Guid id, CancellationToken ct)
        {
            var item = await _contentService.Detail(id, ct);
            return new
            {
                item.Title,
                Url = (_configuration["Email:FrontendUrl"] ?? "").TrimEnd('/') + "/content/" + id
            };
        }
    }
}
