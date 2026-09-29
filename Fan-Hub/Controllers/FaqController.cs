using System.Security.Claims;
using AutoMapper;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Route("api/assistant")]
    public class FaqController : ApiController
    {
        private readonly IFaqService _faqService;

        public FaqController(IFaqService faqService)
        {
            _faqService = faqService;
        }

        [HttpGet("faqs")]
        public Task<List<Faq>> Faqs(CancellationToken ct)
        {
            return _faqService.Faqs(false, ct);
        }
    }
}
