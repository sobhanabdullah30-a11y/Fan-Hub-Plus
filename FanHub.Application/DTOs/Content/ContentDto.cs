using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Application.DTOs.Content
{
    public class ContentDto
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public Guid AuthorId { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string Body { get; set; } = "";
        public ContentType Type { get; set; }
        public string Fandom { get; set; } = "";
        public string Genre { get; set; } = "";
        public List<string> Tags { get; set; } = [];
        public List<string> ImageUrls { get; set; } = [];
        public string? MediaUrl { get; set; }
        public DateTimeOffset? ReleaseDate { get; set; }
        public bool Featured { get; set; }
        public long Views { get; set; }
        public string? City { get; set; }
        public string? Venue { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTimeOffset? StartsAt { get; set; }
        public DateTimeOffset? EndsAt { get; set; }
        public string? TicketUrl { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        public ContentDto()
        {
        }

        public ContentDto(
            Guid id,
            Guid categoryId,
            Guid authorId,
            string title,
            string description,
            string body,
            ContentType type,
            string fandom,
            string genre,
            List<string> tags,
            List<string> imageUrls,
            string? mediaUrl,
            DateTimeOffset? releaseDate,
            bool featured,
            long views,
            string? city,
            string? venue,
            double? latitude,
            double? longitude,
            DateTimeOffset? startsAt,
            DateTimeOffset? endsAt,
            string? ticketUrl,
            DateTimeOffset createdAt)
        {
            this.Id = id;
            this.CategoryId = categoryId;
            this.AuthorId = authorId;
            this.Title = title;
            this.Description = description;
            this.Body = body;
            this.Type = type;
            this.Fandom = fandom;
            this.Genre = genre;
            this.Tags = tags;
            this.ImageUrls = imageUrls;
            this.MediaUrl = mediaUrl;
            this.ReleaseDate = releaseDate;
            this.Featured = featured;
            this.Views = views;
            this.City = city;
            this.Venue = venue;
            this.Latitude = latitude;
            this.Longitude = longitude;
            this.StartsAt = startsAt;
            this.EndsAt = endsAt;
            this.TicketUrl = ticketUrl;
            this.CreatedAt = createdAt;
        }
    }
}
