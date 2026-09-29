using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Infrastructure.Repository
{
    public class ContentRepository : IContentRepository
    {
        private readonly IRepository _repository;
        private readonly ICategoryRepository _categories;
        private readonly IMapper _mapper;

        public ContentRepository(IRepository repository, ICategoryRepository categories, IMapper mapper)
        {
            _repository = repository;
            _categories = categories;
            _mapper = mapper;
        }

        public async Task<Page<ContentDto>> Browse(ContentFilter filter, CancellationToken cancellationToken)
        {
            RequestValidation.CheckPage(filter.Page, filter.PageSize);
            var query = _repository.Query<Content>().Where(x => x.Status == PublicationStatus.Published);
            query = ContentQuery.Filter(query, filter);

            var total = await _repository.Count(query, cancellationToken);
            query = filter.Sort switch
            {
                "upcoming" => query.OrderBy(x => x.ReleaseDate).ThenBy(x => x.Id),
                "popular" => query.OrderByDescending(x => x.Views).ThenBy(x => x.Id),
                "alphabetical" => query.OrderBy(x => x.Title).ThenBy(x => x.Id),
                _ => query.OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id)};
            var rows = await _repository.List(query.Skip((filter.Page - 1) * filter.PageSize).Take(filter.PageSize), cancellationToken);
            return new(rows.Select(_mapper.Map<ContentDto>).ToList(), total, filter.Page, filter.PageSize);
        }

        public async Task<Content> Get(Guid id, bool published, CancellationToken cancellationToken)
        {
            return await _repository.First(_repository.Query<Content>().Where(x => x.Id == id && (!published || x.Status == PublicationStatus.Published)), cancellationToken) ?? throw new AppException(404, "Content not found.");
        }

        public async Task<ContentDto> Detail(Guid id, CancellationToken cancellationToken)
        {
            return _mapper.Map<ContentDto>(await Get(id, true, cancellationToken));
        }

        public async Task RecordView(Guid id, Guid? userId, CancellationToken cancellationToken)
        {
            var item = await Get(id, true, cancellationToken);
            item.Views++;
            if (userId != null)
            {
                _repository.Add(new Activity { UserId = userId.Value, ContentId = id, Action = "Viewed content" });
            }

            await _repository.Save(cancellationToken);
        }

        private async Task Apply(Content content, ContentForCreation request, bool admin, CancellationToken cancellationToken)
        {
            if (!Enum.IsDefined(request.Type))
            {
                throw new AppException(400, "Invalid content type.");
            }

            if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Fandom) || string.IsNullOrWhiteSpace(request.Description))
            {
                throw new AppException(400, "Title, description and fandom are required.");
            }

            if (await _repository.First(_repository.Query<Category>().Where(x => x.Id == request.CategoryId), cancellationToken) == null)
            {
                throw new AppException(400, "Category not found.");
            }

            if (request.Tags.Any(x => string.IsNullOrWhiteSpace(x) || x.Length > 100))
            {
                throw new AppException(400, "Tags must be 1-100 characters.");
            }

            foreach (var url in request.ImageUrls)
            {
                if (string.IsNullOrWhiteSpace(url))
                {
                    throw new AppException(400, "Image URL is required.");
                }

                RequestValidation.CheckUrl(url);
            }

            RequestValidation.CheckUrl(request.MediaUrl);
            RequestValidation.CheckUrl(request.TicketUrl);
            if (request.Type is ContentType.Audio or ContentType.Video && request.MediaUrl == null)
            {
                throw new AppException(400, "Audio and video require a media URL.");
            }

            if (request.Type == ContentType.Event && (request.StartsAt == null || string.IsNullOrWhiteSpace(request.City)))
            {
                throw new AppException(400, "Events require a start time and city.");
            }

            if (request.EndsAt != null && (request.StartsAt == null || request.EndsAt < request.StartsAt))
            {
                throw new AppException(400, "Event end must follow its start.");
            }

            if (request.Latitude.HasValue != request.Longitude.HasValue)
            {
                throw new AppException(400, "Provide both latitude and longitude.");
            }

            if (request.Type == ContentType.Release && request.ReleaseDate == null)
            {
                throw new AppException(400, "Releases require a release date.");
            }

            _mapper.Map(request, content);
            content.Title = request.Title.Trim();
            content.Description = request.Description.Trim();
            content.Fandom = request.Fandom.Trim();
            content.Tags = request.Tags.Distinct().ToList();
            content.Featured = admin && request.Featured;
        }

        public async Task<Content> Create(Guid actor, ContentForCreation request, bool admin, CancellationToken cancellationToken)
        {
            var content = new Content
            {
                AuthorId = actor,
                Status = admin ? PublicationStatus.Published : PublicationStatus.Pending
            };
            await Apply(content, request, admin, cancellationToken);
            _repository.Add(content);
            _repository.Add(new Activity { UserId = actor, ContentId = content.Id, Action = admin ? "Published content" : "Submitted content" });
            await _repository.Save(cancellationToken);
            return content;
        }

        public async Task<Content> Update(Guid actor, Guid id, ContentForCreation request, bool admin, CancellationToken cancellationToken)
        {
            var content = await Get(id, false, cancellationToken);
            if (!admin && content.AuthorId != actor)
            {
                throw new AppException(404, "Submission not found.");
            }

            await Apply(content, request, admin, cancellationToken);
            // Any member edit must pass moderation again, including edits to published submissions.
            if (!admin)
            {
                content.Status = PublicationStatus.Pending;
                content.ModerationNote = null;
            }

            await _repository.Save(cancellationToken);
            return content;
        }

        public async Task Delete(Guid actor, Guid id, bool admin, CancellationToken cancellationToken)
        {
            var content = await Get(id, false, cancellationToken);
            if (!admin && content.AuthorId != actor)
            {
                throw new AppException(404, "Submission not found.");
            }

            _repository.Remove(content);
            await _repository.Save(cancellationToken);
        }

        public async Task<Page<Content>> Submissions(Guid? actor, PublicationStatus? status, int page, int size, CancellationToken cancellationToken)
        {
            RequestValidation.CheckPage(page, size);
            var query = _repository.Query<Content>();
            if (actor != null)
            {
                query = query.Where(x => x.AuthorId == actor);
            }

            if (status != null)
            {
                query = query.Where(x => x.Status == status);
            }

            return new(await _repository.List(query.OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id).Skip((page - 1) * size).Take(size), cancellationToken), await _repository.Count(query, cancellationToken), page, size);
        }

        public async Task Moderate(Guid id, ModerationRequest request, CancellationToken cancellationToken)
        {
            var content = await Get(id, false, cancellationToken);
            content.Status = request.Approve ? PublicationStatus.Published : PublicationStatus.Rejected;
            content.ModerationNote = request.Note;
            await _repository.Save(cancellationToken);
        }

        public async Task<object> Filters(CancellationToken cancellationToken)
        {
            var query = _repository.Query<Content>().Where(x => x.Status == PublicationStatus.Published);
            return new
            {
                Categories = await _categories.Categories(cancellationToken),
                Cities = await _repository.List(query.Where(x => x.Type == ContentType.Event && x.City != null).Select(x => x.City).Distinct().OrderBy(x => x), cancellationToken),
                Types = Enum.GetNames<ContentType>(),
                Fandoms = await _repository.List(query.Select(x => x.Fandom).Distinct().OrderBy(x => x), cancellationToken),
                Genres = await _repository.List(query.Select(x => x.Genre).Distinct().OrderBy(x => x), cancellationToken),
                ReleaseYears = await _repository.List(query.Where(x => x.ReleaseDate != null).Select(x => x.ReleaseDate!.Value.Year).Distinct().OrderByDescending(x => x), cancellationToken)
            };
        }

        public async Task<Page<ContentDto>> Upcoming(Guid? categoryId, int page, int size, CancellationToken cancellationToken)
        {
            RequestValidation.CheckPage(page, size);
            var query = _repository.Query<Content>().Where(x => x.Status == PublicationStatus.Published && x.ReleaseDate > DateTimeOffset.UtcNow);
            if (categoryId != null)
            {
                query = query.Where(x => x.CategoryId == categoryId);
            }

            return new((await _repository.List(query.OrderBy(x => x.ReleaseDate).ThenBy(x => x.Id).Skip((page - 1) * size).Take(size), cancellationToken)).Select(_mapper.Map<ContentDto>).ToList(), await _repository.Count(query, cancellationToken), page, size);
        }
    }
}
