using FanHub.Application.DTOs.Rating;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;

namespace FanHub.Infrastructure.Service
{
    public class RatingService : IRatingService
    {
        private readonly IRatingRepository _repository;

        public RatingService(IRatingRepository repository)
        {
            _repository = repository;
        }

        public Task<object> Ratings(Guid contentId, int page, int size, CancellationToken cancellationToken)
        {
            return _repository.Ratings(contentId, page, size, cancellationToken);
        }

        public Task Rate(Guid userId, Guid contentId, RatingForUpdation request, CancellationToken cancellationToken)
        {
            return _repository.Rate(userId, contentId, request, cancellationToken);
        }

        public Task RemoveRating(Guid userId, Guid contentId, CancellationToken cancellationToken)
        {
            return _repository.RemoveRating(userId, contentId, cancellationToken);
        }
    }
}
