using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Infrastructure.Service
{
    public class ContentService : IContentService
    {
        private readonly IContentRepository _repository;

        public ContentService(IContentRepository repository)
        {
            _repository = repository;
        }

        public Task<Page<ContentDto>> Browse(ContentFilter filter, CancellationToken cancellationToken)
        {
            return _repository.Browse(filter, cancellationToken);
        }

        public Task<Content> Get(Guid id, bool published, CancellationToken cancellationToken)
        {
            return _repository.Get(id, published, cancellationToken);
        }

        public Task<ContentDto> Detail(Guid id, CancellationToken cancellationToken)
        {
            return _repository.Detail(id, cancellationToken);
        }

        public Task RecordView(Guid id, Guid? userId, CancellationToken cancellationToken)
        {
            return _repository.RecordView(id, userId, cancellationToken);
        }

        public Task<Content> Create(Guid actor, ContentForCreation request, bool admin, CancellationToken cancellationToken)
        {
            return _repository.Create(actor, request, admin, cancellationToken);
        }

        public Task<Content> Update(Guid actor, Guid id, ContentForCreation request, bool admin, CancellationToken cancellationToken)
        {
            return _repository.Update(actor, id, request, admin, cancellationToken);
        }

        public Task Delete(Guid actor, Guid id, bool admin, CancellationToken cancellationToken)
        {
            return _repository.Delete(actor, id, admin, cancellationToken);
        }

        public Task<Page<Content>> Submissions(Guid? actor, PublicationStatus? status, int page, int size, CancellationToken cancellationToken)
        {
            return _repository.Submissions(actor, status, page, size, cancellationToken);
        }

        public Task Moderate(Guid id, ModerationRequest request, CancellationToken cancellationToken)
        {
            return _repository.Moderate(id, request, cancellationToken);
        }

        public Task<object> Filters(CancellationToken cancellationToken)
        {
            return _repository.Filters(cancellationToken);
        }

        public Task<Page<ContentDto>> Upcoming(Guid? categoryId, int page, int size, CancellationToken cancellationToken)
        {
            return _repository.Upcoming(categoryId, page, size, cancellationToken);
        }
    }
}
