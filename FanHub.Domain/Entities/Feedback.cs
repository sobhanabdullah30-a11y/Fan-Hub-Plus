using FanHub.Domain.Enums;

namespace FanHub.Domain.Entities
{
    public class Feedback : Entity
    {
        public Guid UserId { get; set; }
        public FeedbackType Type { get; set; }
        public string Message { get; set; } = "";
        public FeedbackStatus Status { get; set; }
        public string? AdminReply { get; set; }
    }
}
