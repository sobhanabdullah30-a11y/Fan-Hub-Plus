using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Feedback;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Infrastructure.Repository
{
    public class FeedbackRepository : IFeedbackRepository
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public FeedbackRepository(IRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Feedback> GetFeedback(Guid id, CancellationToken cancellationToken)
        {
            return await _repository.First(_repository.Query<Feedback>().Where(feedback => feedback.Id == id), cancellationToken) ?? throw new AppException(404, "Feedback not found.");
        }

        public async Task<Feedback> Feedback(Guid id, FeedbackForCreation request, CancellationToken cancellationToken)
        {
            if (!Enum.IsDefined(request.Type) || string.IsNullOrWhiteSpace(request.Message))
            {
                throw new AppException(400, "Invalid feedback.");
            }

            var item = _mapper.Map<Feedback>(request);
            item.UserId = id;
            item.Message = request.Message.Trim();
            _repository.Add(item);
            await _repository.Save(cancellationToken);
            return item;
        }

        public async Task<Page<Feedback>> FeedbackList(Guid? userId, FeedbackStatus? status, bool excludeContactMessages, int page, int size, CancellationToken cancellationToken)
        {
            RequestValidation.CheckPage(page, size);
            var query = _repository.Query<Feedback>();
            if (userId != null)
            {
                query = query.Where(x => x.UserId == userId);
            }

            if (status != null)
            {
                query = query.Where(x => x.Status == status);
            }

            // Contact Us messages are sent to the admin workspace, while a member's
            // dashboard should only show feedback they submitted through platform features.
            if (excludeContactMessages)
            {
                query = query.Where(x => !x.Message.StartsWith("From: "));
            }

            return new(await _repository.List(query.OrderByDescending(x => x.CreatedAt).Skip((page - 1) * size).Take(size), cancellationToken), await _repository.Count(query, cancellationToken), page, size);
        }

        public async Task UpdateFeedback(Guid id, FeedbackForUpdation request, CancellationToken cancellationToken)
        {
            if (!Enum.IsDefined(request.Status))
            {
                throw new AppException(400, "Invalid status.");
            }

            var f = await _repository.First(_repository.Query<Feedback>().Where(x => x.Id == id), cancellationToken) ?? throw new AppException(404, "Feedback not found.");
            _mapper.Map(request, f);
            await _repository.Save(cancellationToken);
        }

        public async Task DeleteFeedback(Guid id, CancellationToken cancellationToken)
        {
            var f = await _repository.First(_repository.Query<Feedback>().Where(x => x.Id == id), cancellationToken) ?? throw new AppException(404, "Feedback not found.");
            _repository.Remove(f);
            await _repository.Save(cancellationToken);
        }
    }
}
