using System.Security.Claims;
using AutoMapper;
using FanHub.Application.DTOs.Rating;
using FanHub.Application.Interface.ServiceInterface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Route("api/content")]
    public class RatingController : ApiController
    {
        private readonly IRatingService _ratingService;

        public RatingController(IRatingService ratingService)
        {
            _ratingService = ratingService;
        }

        [HttpGet("{id:guid}/ratings")]
        public Task<object> Ratings(Guid id, CancellationToken ct, int page = 1, int pageSize = 20)
        {
            return _ratingService.Ratings(id, page, pageSize, ct);
        }

        [Authorize, HttpPut("{id:guid}/rating")]
        public async Task<IActionResult> Rate(Guid id, RatingForUpdation request, CancellationToken ct)
        {
            await _ratingService.Rate(UserId, id, request, ct);
            return NoContent();
        }

        [Authorize, HttpDelete("{id:guid}/rating")]
        public async Task<IActionResult> DeleteRating(Guid id, CancellationToken ct)
        {
            await _ratingService.RemoveRating(UserId, id, ct);
            return NoContent();
        }
    }
}
