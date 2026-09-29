using System.ComponentModel.DataAnnotations;
using FanHub.Application.Common;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Application.DTOs.Content
{
    public class ContentFilter
    {
        [MaxLength(200)]
        public string? Search { get; set; }
        public Guid? CategoryId { get; set; }

        [MaxLength(100)]
        public string? Fandom { get; set; }

        [MaxLength(100)]
        public string? Genre { get; set; }

        [MaxLength(100)]
        public string? Tag { get; set; }

        [Range(1900, 2200)]
        public int? ReleaseYear { get; set; }
        public ContentType? Type { get; set; }

        [MaxLength(8)]
        public List<ContentType> Types { get; set; } = [];

        [MaxLength(100)]
        public List<Guid> ContentIds { get; set; } = [];
        public bool Upcoming { get; set; }

        [Range(0, long.MaxValue)]
        public long? MinPopularity { get; set; }
        public bool? Featured { get; set; }

        [RegularExpression("^(latest|popular|alphabetical|upcoming)$")]
        public string Sort { get; set; } = "latest";

        [Range(1, 100000)]
        public int Page { get; set; } = 1;

        [Range(1, 100)]
        public int PageSize { get; set; } = 20;
    }
}
