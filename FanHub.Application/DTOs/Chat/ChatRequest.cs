using System.ComponentModel.DataAnnotations;

namespace FanHub.Application.DTOs.Chat
{
    public class ChatRequest
    {
        public Guid? ConversationId { get; set; }

        [Required, MaxLength(2000)]
        public string Message { get; set; } = "";

        public ChatRequest()
        {
        }

        public ChatRequest(Guid? conversationId, string message)
        {
            this.ConversationId = conversationId;
            this.Message = message;
        }
    }
}
