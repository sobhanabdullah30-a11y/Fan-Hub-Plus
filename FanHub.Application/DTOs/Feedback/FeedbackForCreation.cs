using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Application.DTOs.Feedback
{
    public class FeedbackForCreation
    {
        public FeedbackType Type { get; set; }

        [Required, MaxLength(4000)]
        public string Message { get; set; } = "";

        public FeedbackForCreation()
        {
        }

        public FeedbackForCreation(FeedbackType type, string message)
        {
            this.Type = type;
            this.Message = message;
        }
    }
}
