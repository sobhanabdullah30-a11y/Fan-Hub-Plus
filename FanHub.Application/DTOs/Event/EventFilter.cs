using System.ComponentModel.DataAnnotations;
using FanHub.Application.Common;

namespace FanHub.Application.DTOs.Event
{
    public class EventFilter
    {
        [MaxLength(100)]
        public string? City { get; set; }
        public DateTimeOffset? From { get; set; }
        public DateTimeOffset? To { get; set; }

        [Range(-90, 90)]
        public double? Latitude { get; set; }

        [Range(-180, 180)]
        public double? Longitude { get; set; }

        [Range(1, 500)]
        public double RadiusKm { get; set; } = 50;

        [Range(1, 100000)]
        public int Page { get; set; } = 1;

        [Range(1, 100)]
        public int PageSize { get; set; } = 20;
    }
}
