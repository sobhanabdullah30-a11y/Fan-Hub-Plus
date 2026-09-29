using System.Security.Claims;
using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Chat;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Route("api/assistant")]
    public class ChatController : ApiController
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [Authorize, HttpPost("messages")]
        public Task<ChatMessage> Chat(ChatRequest request, CancellationToken ct)
        {
            return _chatService.Chat(UserId, request, ct);
        }

        [Authorize, HttpGet("messages")]
        public Task<Page<ChatMessage>> History(CancellationToken ct, Guid? conversationId = null, int page = 1, int pageSize = 20)
        {
            return _chatService.ChatHistory(UserId, conversationId, page, pageSize, ct);
        }

        [Authorize, HttpDelete("conversations/{id:guid}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        {
            await _chatService.DeleteChat(UserId, id, ct);
            return NoContent();
        }
    }
}
