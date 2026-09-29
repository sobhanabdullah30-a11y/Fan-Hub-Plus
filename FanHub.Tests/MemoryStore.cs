using FanHub.Api.Configuration;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Domain.Entities;
using FanHub.Infrastructure;
using FanHub.Tests;
using Microsoft.Extensions.Configuration;

namespace FanHub.Tests
{
    public sealed class MemoryStore : IRepository
    {
        private readonly Dictionary<Type, object> tables = [];
        private List<T> Table<T>()
            where T : Entity
        {
            if (!tables.TryGetValue(typeof(T), out var table))
            {
                table = new List<T>();
                tables[typeof(T)] = table;
            }

            return (List<T>)table;
        }

        public IQueryable<T> Query<T>()
            where T : Entity
        {
            return Table<T>().AsQueryable();
        }

        public Task<List<T>> List<T>(IQueryable<T> query, CancellationToken ct = default)
        {
            return Task.FromResult(query.ToList());
        }

        public Task<int> Count<T>(IQueryable<T> query, CancellationToken ct = default)
        {
            return Task.FromResult(query.Count());
        }

        public Task<T?> First<T>(IQueryable<T> query, CancellationToken ct = default)
        {
            return Task.FromResult(query.FirstOrDefault());
        }

        public void Add<T>(T entity)
            where T : Entity
        {
            Table<T>().Add(entity);
        }

        public void Remove<T>(T entity)
            where T : Entity
        {
            Table<T>().Remove(entity);
        }

        public Task Save(CancellationToken ct = default)
        {
            return Task.CompletedTask;
        }
    }
}
