using FanHub.Application.DTOs.Category;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;

namespace FanHub.Infrastructure.Service
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repository;

        public CategoryService(ICategoryRepository repository)
        {
            _repository = repository;
        }

        public Task<List<Category>> Categories(CancellationToken cancellationToken)
        {
            return _repository.Categories(cancellationToken);
        }

        public Task<Category> SaveCategory(Guid? id, CategoryForCreation request, CancellationToken cancellationToken)
        {
            return _repository.SaveCategory(id, request, cancellationToken);
        }

        public Task DeleteCategory(Guid id, CancellationToken cancellationToken)
        {
            return _repository.DeleteCategory(id, cancellationToken);
        }
    }
}
