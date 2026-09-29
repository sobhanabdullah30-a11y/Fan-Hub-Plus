using System.Security.Claims;
using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Application.DTOs.Event;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Route("api/events")]
    public sealed class EventsController : ApiController
    {
        private readonly IEventService _eventService;
        private readonly IContentService _contentService;

        public EventsController(IEventService eventService, IContentService contentService)
        {
            _eventService = eventService;
            _contentService = contentService;
        }

        [HttpGet]
        public Task<Page<ContentDto>> Events([FromQuery] EventFilter filter, CancellationToken ct)
        {
            return _eventService.Events(filter, ct);
        }

        [HttpGet("{id:guid}")]
        public async Task<ContentDto> Detail(Guid id, CancellationToken ct)
        {
            var content = await _contentService.Detail(id, ct);
            if (content.Type != ContentType.Event)
            {
                throw new AppException(404, "Event not found.");
            }

            return content;
        }

        [HttpGet("{id:guid}/calendar")]
        [Produces("text/calendar")]
        public async Task<IActionResult> Calendar(Guid id, CancellationToken ct)
        {
            var e = await _contentService.Detail(id, ct);
            if (e.Type != ContentType.Event || e.StartsAt == null)
            {
                throw new AppException(404, "Event not found.");
            }

            static string Escape(string? s) => (s ?? "").Replace("\\", "\\\\").Replace(";", "\\;").Replace(",", "\\,").Replace("\r", "").Replace("\n", "\\n");
            static string Date(DateTimeOffset d) => d.UtcDateTime.ToString("yyyyMMdd'T'HHmmss'Z'");
            var lines = new List<string>
            {
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Fan Hub Plus//Events//EN",
                "BEGIN:VEVENT",
                "UID:" + id + "@fanhub",
                "DTSTAMP:" + Date(DateTimeOffset.UtcNow),
                "DTSTART:" + Date(e.StartsAt.Value),
                "SUMMARY:" + Escape(e.Title),
                "DESCRIPTION:" + Escape(e.Description),
                "LOCATION:" + Escape(e.Venue + ", " + e.City)
            };
            if (e.EndsAt != null)
            {
                lines.Add("DTEND:" + Date(e.EndsAt.Value));
            }

            if (e.TicketUrl != null)
            {
                lines.Add("URL:" + e.TicketUrl);
            }

            lines.AddRange(["END:VEVENT", "END:VCALENDAR"]);
            // Fold by UTF-8 octet length without splitting Unicode scalars (RFC 5545).
            var folded = new List<string>();
            foreach (var line in lines)
            {
                var part = new System.Text.StringBuilder();
                var bytes = 0;
                foreach (var rune in line.EnumerateRunes())
                {
                    if (bytes + rune.Utf8SequenceLength > 75)
                    {
                        folded.Add(part.ToString());
                        part.Clear();
                        part.Append(' ');
                        bytes = 1;
                    }

                    part.Append(rune.ToString());
                    bytes += rune.Utf8SequenceLength;
                }

                folded.Add(part.ToString());
            }

            return File(System.Text.Encoding.UTF8.GetBytes(string.Join("\r\n", folded) + "\r\n"), "text/calendar", $"event-{id}.ics");
        }
    }
}
