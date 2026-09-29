using FanHub.Domain.Entities;

namespace FanHub.Application.Interface.RepositoryInterface
{
    public interface IRepository
    {
        IQueryable<T> Query<T>()
            where T : Entity;
        Task<List<T>> List<T>(IQueryable<T> query, CancellationToken cancellationToken = default);
        Task<int> Count<T>(IQueryable<T> query, CancellationToken cancellationToken = default);
        Task<T?> First<T>(IQueryable<T> query, CancellationToken cancellationToken = default);
        void Add<T>(T entity)
            where T : Entity;
        void Remove<T>(T entity)
            where T : Entity;
        Task Save(CancellationToken cancellationToken = default);
    }
}
