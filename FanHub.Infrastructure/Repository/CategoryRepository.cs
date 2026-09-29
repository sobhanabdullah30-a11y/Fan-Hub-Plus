using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Category;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Domain.Entities;

namespace FanHub.Infrastructure.Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public CategoryRepository(IRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<Category>> Categories(CancellationToken cancellationToken)
        {
            return await _repository.List(_repository.Query<Category>().OrderBy(x => x.Name), cancellationToken);
        }

        public async Task<Category> SaveCategory(Guid? id, CategoryForCreation request, CancellationToken cancellationToken)
        {
            var name = request.Name.Trim();
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new AppException(400, "Category name is required.");
            }

            if (await _repository.First(_repository.Query<Category>().Where(x => x.Name == name && x.Id != id), cancellationToken) != null)
            {
                throw new AppException(409, "Category already exists.");
            }

            var category = id == null ? _mapper.Map<Category>(request) : await _repository.First(_repository.Query<Category>().Where(x => x.Id == id), cancellationToken) ?? throw new AppException(404, "Category not found.");
            category.Name = name;
            category.Description = request.Description;
            if (id == null)
            {
                _repository.Add(category);
            }

            await _repository.Save(cancellationToken);
            return category;
        }

        public async Task DeleteCategory(Guid id, CancellationToken cancellationToken)
        {
            var item = await _repository.First(_repository.Query<Category>().Where(x => x.Id == id), cancellationToken) ?? throw new AppException(404, "Category not found.");
            if (await _repository.Count(_repository.Query<Content>().Where(x => x.CategoryId == id), cancellationToken) > 0 || await _repository.Count(_repository.Query<UserInterest>().Where(x => x.CategoryId == id), cancellationToken) > 0)
            {
                throw new AppException(409, "Category is in use.");
            }

            _repository.Remove(item);
            await _repository.Save(cancellationToken);
        }
    }
}
