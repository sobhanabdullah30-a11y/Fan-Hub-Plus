using FanHub.Application.DTOs.Rating;

namespace FanHub.Application.Interface.ServiceInterface
{
    public interface IRatingService
    {
        Task<object> Ratings(Guid contentId, int page, int size, CancellationToken cancellationToken);
        Task Rate(Guid userId, Guid contentId, RatingForUpdation request, CancellationToken cancellationToken);
        Task RemoveRating(Guid userId, Guid contentId, CancellationToken cancellationToken);
    }
}
