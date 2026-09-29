using FanHub.Application.DTOs.Faq;
using FanHub.Domain.Entities;

namespace FanHub.Application.Interface.ServiceInterface
{
    public interface IFaqService
    {
        Task<List<Faq>> Faqs(bool admin, CancellationToken cancellationToken);
        Task<Faq> SaveFaq(Guid? id, FaqForCreation request, CancellationToken cancellationToken);
        Task DeleteFaq(Guid id, CancellationToken cancellationToken);
    }
}
