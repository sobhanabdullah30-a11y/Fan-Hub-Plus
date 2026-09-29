using System.Security.Claims;
using AutoMapper;
using FanHub.Application.DTOs.Faq;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Authorize(Roles = "Admin"), Route("api/admin")]
    public class AdminFaqController : ApiController
    {
        private readonly IFaqService _faqService;

        public AdminFaqController(IFaqService faqService)
        {
            _faqService = faqService;
        }

        [HttpGet("faqs")]
        public Task<List<Faq>> Faqs(CancellationToken ct)
        {
            return _faqService.Faqs(true, ct);
        }

        [HttpPost("faqs")]
        public async Task<IActionResult> CreateFaq(FaqForCreation request, CancellationToken ct)
        {
            var item = await _faqService.SaveFaq(null, request, ct);
            return StatusCode(201, item);
        }

        [HttpPut("faqs/{id:guid}")]
        public Task<Faq> UpdateFaq(Guid id, FaqForUpdation request, CancellationToken ct)
        {
            return _faqService.SaveFaq(id, request, ct);
        }

        [HttpDelete("faqs/{id:guid}")]
        public async Task<IActionResult> DeleteFaq(Guid id, CancellationToken ct)
        {
            await _faqService.DeleteFaq(id, ct);
            return NoContent();
        }
    }
}
