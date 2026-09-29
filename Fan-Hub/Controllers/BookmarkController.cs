using FanHub.Application.DTOs.Content;
using System.Security.Claims;
using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Bookmark;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Authorize, Route("api/me")]
    public class BookmarkController : ApiController
    {
        private readonly IBookmarkService _bookmarkService;

        public BookmarkController(IBookmarkService bookmarkService)
        {
            _bookmarkService = bookmarkService;
        }

        [HttpGet("bookmarks")]
        public Task<Page<object>> Bookmarks(CancellationToken ct, [FromQuery] ContentFilter filter)
        {
            return _bookmarkService.Bookmarks(UserId, filter.Page, filter.PageSize, ct, filter);
        }

        [HttpPut("bookmarks/{contentId:guid}")]
        public async Task<IActionResult> Bookmark(Guid contentId, BookmarkForUpdation request, CancellationToken ct)
        {
            await _bookmarkService.SaveBookmark(UserId, contentId, request.Note, ct);
            return NoContent();
        }

        [HttpDelete("bookmarks/{contentId:guid}")]
        public async Task<IActionResult> DeleteBookmark(Guid contentId, CancellationToken ct)
        {
            await _bookmarkService.RemoveBookmark(UserId, contentId, ct);
            return NoContent();
        }
    }
}
