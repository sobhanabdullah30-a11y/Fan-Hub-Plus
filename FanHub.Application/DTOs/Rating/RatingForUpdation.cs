using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.Rating
{
    public class RatingForUpdation
    {
        [Range(1, 5)]
        public int Stars { get; set; }

        [MaxLength(2000)]
        public string Comment { get; set; } = "";

        public RatingForUpdation()
        {
        }

        public RatingForUpdation(int stars, string comment)
        {
            this.Stars = stars;
            this.Comment = comment;
        }
    }
}
