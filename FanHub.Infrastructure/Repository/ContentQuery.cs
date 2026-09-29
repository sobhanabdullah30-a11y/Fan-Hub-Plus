using FanHub.Application.DTOs.Content;
using FanHub.Domain.Entities;

namespace FanHub.Infrastructure.Repository
{
    internal static class ContentQuery
    {
        public static IQueryable<Content> Filter(IQueryable<Content> query, ContentFilter filter)
        {
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                query = query.Where(x => x.Title.Contains(filter.Search) || x.Description.Contains(filter.Search) || x.Body.Contains(filter.Search) || x.Genre.Contains(filter.Search) || x.Fandom.Contains(filter.Search));
            }

            if (filter.CategoryId != null)
            {
                query = query.Where(x => x.CategoryId == filter.CategoryId);
            }

            if (filter.Type != null)
            {
                query = query.Where(x => x.Type == filter.Type);
            }

            if (filter.Fandom != null)
            {
                query = query.Where(x => x.Fandom == filter.Fandom);
            }

            if (filter.Genre != null)
            {
                query = query.Where(x => x.Genre == filter.Genre);
            }

            if (filter.Tag != null)
            {
                query = query.Where(x => x.Tags.Contains(filter.Tag));
            }

            if (filter.ReleaseYear != null)
            {
                query = query.Where(x => x.ReleaseDate != null && x.ReleaseDate.Value.Year == filter.ReleaseYear);
            }

            if (filter.MinPopularity != null)
            {
                query = query.Where(x => x.Views >= filter.MinPopularity);
            }

            if (filter.Featured != null)
            {
                query = query.Where(x => x.Featured == filter.Featured);
            }

            if (filter.Types.Count > 0)
            {
                query = query.Where(x => filter.Types.Contains(x.Type));
            }

            if (filter.ContentIds.Count > 0)
            {
                query = query.Where(x => filter.ContentIds.Contains(x.Id));
            }

            if (filter.Upcoming)
            {
                query = query.Where(x => x.ReleaseDate > DateTimeOffset.UtcNow);
            }

            return query;
        }
    }
}
