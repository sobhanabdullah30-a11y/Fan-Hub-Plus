using FanHub.Domain.Enums;

namespace FanHub.Domain.Entities
{
    // One content aggregate lets bookmarks, moderation, tags and ratings share real foreign keys.
    public class Content : Entity
    {
        public Guid CategoryId { get; set; }
        public Guid AuthorId { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string Body { get; set; } = "";
        public ContentType Type { get; set; }
        public PublicationStatus Status { get; set; } = PublicationStatus.Pending;
        public string Fandom { get; set; } = "";
        public string Genre { get; set; } = "";
        public List<string> Tags { get; set; } = [];
        public List<string> ImageUrls { get; set; } = [];
        public string? MediaUrl { get; set; }
        public DateTimeOffset? ReleaseDate { get; set; }
        public bool Featured { get; set; }
        public long Views { get; set; }
        public string? ModerationNote { get; set; }
        public string? City { get; set; }
        public string? Venue { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTimeOffset? StartsAt { get; set; }
        public DateTimeOffset? EndsAt { get; set; }
        public string? TicketUrl { get; set; }
    }
}
