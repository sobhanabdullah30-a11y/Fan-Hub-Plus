namespace FanHub.Domain.Entities
{
    public class ChatMessage : Entity
    {
        public Guid UserId { get; set; }
        public Guid ConversationId { get; set; }
        public string Message { get; set; } = "";
        public string Response { get; set; } = "";
    }
}
