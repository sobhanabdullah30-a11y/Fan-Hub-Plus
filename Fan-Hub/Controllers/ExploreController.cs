using System.Security.Claims;
using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Route("api/explore")]
    public sealed class ExploreController : ApiController
    {
        private readonly IContentService _contentService;

        public ExploreController(IContentService contentService)
        {
            _contentService = contentService;
        }

        [HttpGet("articles")]
        public Task<Page<ContentDto>> Articles([FromQuery] ContentFilter f, CancellationToken ct)
        {
            f.Type = ContentType.Article;
            return _contentService.Browse(f, ct);
        }

        [HttpGet("characters")]
        public Task<Page<ContentDto>> Characters([FromQuery] ContentFilter f, CancellationToken ct)
        {
            f.Type = ContentType.Character;
            return _contentService.Browse(f, ct);
        }

        [HttpGet("videos")]
        public Task<Page<ContentDto>> Videos([FromQuery] ContentFilter f, CancellationToken ct)
        {
            f.Type = ContentType.Video;
            return _contentService.Browse(f, ct);
        }

        [HttpGet("audio")]
        public Task<Page<ContentDto>> Audio([FromQuery] ContentFilter f, CancellationToken ct)
        {
            f.Type = ContentType.Audio;
            return _contentService.Browse(f, ct);
        }

        [HttpGet("galleries")]
        public Task<Page<ContentDto>> Galleries([FromQuery] ContentFilter f, CancellationToken ct)
        {
            f.Type = ContentType.Image;
            return _contentService.Browse(f, ct);
        }

        [HttpGet("merchandise")]
        public Task<Page<ContentDto>> Merchandise([FromQuery] ContentFilter f, CancellationToken ct)
        {
            f.Type = ContentType.Merchandise;
            return _contentService.Browse(f, ct);
        }

        [HttpGet("upcoming")]
        public Task<Page<ContentDto>> Upcoming(CancellationToken ct, Guid? categoryId = null, int page = 1, int pageSize = 20)
        {
            return _contentService.Upcoming(categoryId, page, pageSize, ct);
        }
    }
}
