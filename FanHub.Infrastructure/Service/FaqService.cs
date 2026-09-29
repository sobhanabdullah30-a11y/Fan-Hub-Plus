using FanHub.Application.DTOs.Faq;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;

namespace FanHub.Infrastructure.Service
{
    public class FaqService : IFaqService
    {
        private readonly IFaqRepository _repository;

        public FaqService(IFaqRepository repository)
        {
            _repository = repository;
        }

        public Task<List<Faq>> Faqs(bool admin, CancellationToken cancellationToken)
        {
            return _repository.Faqs(admin, cancellationToken);
        }

        public Task<Faq> SaveFaq(Guid? id, FaqForCreation request, CancellationToken cancellationToken)
        {
            return _repository.SaveFaq(id, request, cancellationToken);
        }

        public Task DeleteFaq(Guid id, CancellationToken cancellationToken)
        {
            return _repository.DeleteFaq(id, cancellationToken);
        }
    }
}
