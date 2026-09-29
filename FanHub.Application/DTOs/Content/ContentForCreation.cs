using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Application.DTOs.Content
{
    public class ContentForCreation
    {
        public Guid CategoryId { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = "";

        [Required, MaxLength(4000)]
        public string Description { get; set; } = "";

        [MaxLength(100000)]
        public string Body { get; set; } = "";
        public ContentType Type { get; set; }

        [Required, MaxLength(100)]
        public string Fandom { get; set; } = "";

        [MaxLength(100)]
        public string Genre { get; set; } = "";

        [Required, MaxLength(30)]
        public List<string> Tags { get; set; } = [];

        [Required, MaxLength(30)]
        public List<string> ImageUrls { get; set; } = [];

        [MaxLength(2000)]
        public string? MediaUrl { get; set; }
        public DateTimeOffset? ReleaseDate { get; set; }
        public bool Featured { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(300)]
        public string? Venue { get; set; }

        [Range(-90, 90)]
        public double? Latitude { get; set; }

        [Range(-180, 180)]
        public double? Longitude { get; set; }
        public DateTimeOffset? StartsAt { get; set; }
        public DateTimeOffset? EndsAt { get; set; }

        [MaxLength(2000)]
        public string? TicketUrl { get; set; }
    }
}
