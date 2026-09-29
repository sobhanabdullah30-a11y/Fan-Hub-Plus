using FanHub.Application.Common;
using FanHub.Application.DTOs.Feedback;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Infrastructure.Service
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IFeedbackRepository _repository;

        public FeedbackService(IFeedbackRepository repository)
        {
            _repository = repository;
        }

        public Task<Feedback> GetFeedback(Guid id, CancellationToken cancellationToken)
        {
            return _repository.GetFeedback(id, cancellationToken);
        }

        public Task<Feedback> Feedback(Guid id, FeedbackForCreation request, CancellationToken cancellationToken)
        {
            return _repository.Feedback(id, request, cancellationToken);
        }

        public Task<Page<Feedback>> FeedbackList(Guid? userId, FeedbackStatus? status, bool excludeContactMessages, int page, int size, CancellationToken cancellationToken)
        {
            return _repository.FeedbackList(userId, status, excludeContactMessages, page, size, cancellationToken);
        }

        public Task UpdateFeedback(Guid id, FeedbackForUpdation request, CancellationToken cancellationToken)
        {
            return _repository.UpdateFeedback(id, request, cancellationToken);
        }

        public Task DeleteFeedback(Guid id, CancellationToken cancellationToken)
        {
            return _repository.DeleteFeedback(id, cancellationToken);
        }
    }
}
