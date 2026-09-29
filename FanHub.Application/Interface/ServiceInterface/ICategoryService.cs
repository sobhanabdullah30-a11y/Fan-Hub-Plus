using FanHub.Application.DTOs.Category;
using FanHub.Domain.Entities;

namespace FanHub.Application.Interface.ServiceInterface
{
    public interface ICategoryService
    {
        Task<List<Category>> Categories(CancellationToken cancellationToken);
        Task<Category> SaveCategory(Guid? id, CategoryForCreation request, CancellationToken cancellationToken);
        Task DeleteCategory(Guid id, CancellationToken cancellationToken);
    }
}
