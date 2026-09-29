using FanHub.Application.Common;
using FanHub.Application.DTOs.Feedback;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Application.Interface.RepositoryInterface
{
    public interface IFeedbackRepository
    {
        Task<Feedback> GetFeedback(Guid id, CancellationToken cancellationToken);
        Task<Feedback> Feedback(Guid id, FeedbackForCreation request, CancellationToken cancellationToken);
        Task<Page<Feedback>> FeedbackList(Guid? userId, FeedbackStatus? status, bool excludeContactMessages, int page, int size, CancellationToken cancellationToken);
        Task UpdateFeedback(Guid id, FeedbackForUpdation request, CancellationToken cancellationToken);
        Task DeleteFeedback(Guid id, CancellationToken cancellationToken);
    }
}
