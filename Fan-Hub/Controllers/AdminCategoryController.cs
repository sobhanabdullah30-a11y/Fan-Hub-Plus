using System.Security.Claims;
using AutoMapper;
using FanHub.Application.DTOs.Category;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Controllers
{
    [Authorize(Roles = "Admin"), Route("api/admin")]
    public class AdminCategoryController : ApiController
    {
        private readonly ICategoryService _categoryService;

        public AdminCategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory(CategoryForCreation request, CancellationToken ct)
        {
            var item = await _categoryService.SaveCategory(null, request, ct);
            return StatusCode(201, item);
        }

        [HttpPut("categories/{id:guid}")]
        public Task<Category> UpdateCategory(Guid id, CategoryForUpdation request, CancellationToken ct)
        {
            return _categoryService.SaveCategory(id, request, ct);
        }

        [HttpDelete("categories/{id:guid}")]
        public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken ct)
        {
            await _categoryService.DeleteCategory(id, ct);
            return NoContent();
        }
    }
}
