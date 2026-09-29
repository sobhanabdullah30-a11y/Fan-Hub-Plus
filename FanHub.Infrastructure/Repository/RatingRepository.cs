using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Rating;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Domain.Entities;

namespace FanHub.Infrastructure.Repository
{
    public class RatingRepository : IRatingRepository
    {
        private readonly IRepository _repository;
        private readonly IContentRepository _contents;
        private readonly IMapper _mapper;

        public RatingRepository(IRepository repository, IContentRepository contents, IMapper mapper)
        {
            _repository = repository;
            _contents = contents;
            _mapper = mapper;
        }

        public async Task<object> Ratings(Guid contentId, int page, int size, CancellationToken cancellationToken)
        {
            RequestValidation.CheckPage(page, size);
            await _contents.Get(contentId, true, cancellationToken);
            var query = _repository.Query<Rating>().Where(x => x.ContentId == contentId);
            var grouped = await _repository.List(query.GroupBy(x => x.Stars).Select(x => new { Stars = x.Key, Count = x.Count() }), cancellationToken);
            var total = grouped.Sum(x => x.Count);
            var rows = await _repository.List(query.OrderByDescending(x => x.CreatedAt).Skip((page - 1) * size).Take(size).Select(x => new { x.Id, x.UserId, x.Stars, x.Comment, x.CreatedAt }), cancellationToken);
            return new
            {
                Average = total == 0 ? 0 : grouped.Sum(x => x.Stars * x.Count) / (double)total,
                Total = total,
                Items = rows,
                PageNumber = page,
                PageSize = size
            };
        }

        public async Task Rate(Guid userId, Guid contentId, RatingForUpdation request, CancellationToken cancellationToken)
        {
            await _contents.Get(contentId, true, cancellationToken);

            var rating = await _repository.First(_repository.Query<Rating>().Where(x => x.UserId == userId && x.ContentId == contentId), cancellationToken);
            if (rating == null)
            {
                rating = new Rating
                {
                    UserId = userId,
                    ContentId = contentId
                };
                _repository.Add(rating);
            }

            _mapper.Map(request, rating);
            await _repository.Save(cancellationToken);
        }

        public async Task RemoveRating(Guid userId, Guid contentId, CancellationToken cancellationToken)
        {
            var r = await _repository.First(_repository.Query<Rating>().Where(x => x.UserId == userId && x.ContentId == contentId), cancellationToken);
            if (r != null)
            {
                _repository.Remove(r);
                await _repository.Save(cancellationToken);
            }
        }
    }
}
