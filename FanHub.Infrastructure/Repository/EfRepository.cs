using FanHub.Application.Common;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Domain.DatabaseConfiq;
using FanHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FanHub.Infrastructure.Repository
{
    public sealed class EfRepository : IRepository
    {
        private readonly ApplicationDbContext _context;

        public EfRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public IQueryable<T> Query<T>()
            where T : Entity
        {
            return _context.Set<T>();
        }

        public Task<List<T>> List<T>(IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            return query.ToListAsync(cancellationToken);
        }

        public Task<int> Count<T>(IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            return query.CountAsync(cancellationToken);
        }

        public Task<T?> First<T>(IQueryable<T> query, CancellationToken cancellationToken = default)
        {
            return query.FirstOrDefaultAsync(cancellationToken);
        }

        public void Add<T>(T entity)
            where T : Entity
        {
            _context.Set<T>().Add(entity);
        }

        public void Remove<T>(T entity)
            where T : Entity
        {
            _context.Set<T>().Remove(entity);
        }

        public async Task Save(CancellationToken cancellationToken = default)
        {
            try
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new AppException(409, "This record changed during the request. Reload and retry.");
            }
            catch (DbUpdateException ex)when (ex.InnerException is Microsoft.Data.SqlClient.SqlException sql && sql.Number is 2601 or 2627 or 547)
            {
                throw new AppException(409, "The operation conflicts with an existing record or relationship.");
            }
        }
    }
}
