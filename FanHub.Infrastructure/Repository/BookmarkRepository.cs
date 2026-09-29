using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Infrastructure.Repository
{
    public class BookmarkRepository : IBookmarkRepository
    {
        private readonly IRepository _repository;
        private readonly IContentRepository _contents;
        private readonly IMapper _mapper;

        public BookmarkRepository(IRepository repository, IContentRepository contents, IMapper mapper)
        {
            _repository = repository;
            _contents = contents;
            _mapper = mapper;
        }

        public async Task<Page<object>> Bookmarks(Guid userId, int page, int size, CancellationToken cancellationToken, ContentFilter? filter = null)
        {
            RequestValidation.CheckPage(page, size);
            var content = ContentQuery.Filter(_repository.Query<Content>(), filter ?? new ContentFilter());
            var query =
                from b in _repository.Query<Bookmark>()
                join c in content on b.ContentId equals c.Id
                where b.UserId == userId && c.Status == PublicationStatus.Published
                orderby b.CreatedAt descending
                select new
                {
                    Bookmark = b,
                    Content = c
                };
            query = filter?.Sort switch
            {
                "popular" => query.OrderByDescending(x => x.Content.Views).ThenBy(x => x.Content.Id),
                "alphabetical" => query.OrderBy(x => x.Content.Title).ThenBy(x => x.Content.Id),
                _ => query.OrderByDescending(x => x.Bookmark.CreatedAt).ThenBy(x => x.Bookmark.Id)
            };
            var total = await _repository.Count(query, cancellationToken);
            var rows = await _repository.List(query.Skip((page - 1) * size).Take(size), cancellationToken);
            return new(rows.Select(x => (object)new { x.Bookmark.Id, x.Bookmark.ContentId, x.Bookmark.Note, x.Bookmark.CreatedAt, Content = _mapper.Map<ContentDto>(x.Content) }).ToList(), total, page, size);
        }

        public async Task SaveBookmark(Guid userId, Guid contentId, string note, CancellationToken cancellationToken)
        {
            await _contents.Get(contentId, true, cancellationToken);
            var b = await _repository.First(_repository.Query<Bookmark>().Where(x => x.UserId == userId && x.ContentId == contentId), cancellationToken);
            if (b == null)
            {
                b = new Bookmark
                {
                    UserId = userId,
                    ContentId = contentId
                };
                _repository.Add(b);
                _repository.Add(new Activity { UserId = userId, ContentId = contentId, Action = "Bookmarked content" });
            }

            b.Note = note;
            await _repository.Save(cancellationToken);
        }

        public async Task RemoveBookmark(Guid userId, Guid contentId, CancellationToken cancellationToken)
        {
            var b = await _repository.First(_repository.Query<Bookmark>().Where(x => x.UserId == userId && x.ContentId == contentId), cancellationToken);
            if (b != null)
            {
                _repository.Remove(b);
                await _repository.Save(cancellationToken);
            }
        }
    }
}

