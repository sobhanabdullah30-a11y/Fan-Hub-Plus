using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Faq;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Domain.Entities;

namespace FanHub.Infrastructure.Repository
{
    public class FaqRepository : IFaqRepository
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public FaqRepository(IRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<Faq>> Faqs(bool admin, CancellationToken cancellationToken)
        {
            return await _repository.List(_repository.Query<Faq>().Where(x => admin || x.Published).OrderBy(x => x.Question), cancellationToken);
        }

        public async Task<Faq> SaveFaq(Guid? id, FaqForCreation request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Question) || string.IsNullOrWhiteSpace(request.Answer))
            {
                throw new AppException(400, "Question and answer are required.");
            }

            var f = id == null ? _mapper.Map<Faq>(request) : await _repository.First(_repository.Query<Faq>().Where(x => x.Id == id), cancellationToken) ?? throw new AppException(404, "FAQ not found.");
            f.Question = request.Question.Trim();
            f.Answer = request.Answer.Trim();
            f.Published = request.Published;
            if (id == null)
            {
                _repository.Add(f);
            }

            await _repository.Save(cancellationToken);
            return f;
        }

        public async Task DeleteFaq(Guid id, CancellationToken cancellationToken)
        {
            var f = await _repository.First(_repository.Query<Faq>().Where(x => x.Id == id), cancellationToken) ?? throw new AppException(404, "FAQ not found.");
            _repository.Remove(f);
            await _repository.Save(cancellationToken);
        }
    }
}
