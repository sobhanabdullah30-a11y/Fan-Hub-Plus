using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Application.DTOs.Feedback
{
    public class FeedbackForUpdation
    {
        public FeedbackStatus Status { get; set; }

        [MaxLength(4000)]
        public string? AdminReply { get; set; }

        public FeedbackForUpdation()
        {
        }

        public FeedbackForUpdation(FeedbackStatus status, string? adminReply)
        {
            this.Status = status;
            this.AdminReply = adminReply;
        }
    }
}
