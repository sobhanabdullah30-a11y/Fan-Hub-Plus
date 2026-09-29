using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Application.Interface.RepositoryInterface
{
    public interface IContentRepository
    {
        Task<Page<ContentDto>> Browse(ContentFilter filter, CancellationToken cancellationToken);
        Task<Content> Get(Guid id, bool published, CancellationToken cancellationToken);
        Task<ContentDto> Detail(Guid id, CancellationToken cancellationToken);
        Task RecordView(Guid id, Guid? userId, CancellationToken cancellationToken);
        Task<Content> Create(Guid actor, ContentForCreation request, bool admin, CancellationToken cancellationToken);
        Task<Content> Update(Guid actor, Guid id, ContentForCreation request, bool admin, CancellationToken cancellationToken);
        Task Delete(Guid actor, Guid id, bool admin, CancellationToken cancellationToken);
        Task<Page<Content>> Submissions(Guid? actor, PublicationStatus? status, int page, int size, CancellationToken cancellationToken);
        Task Moderate(Guid id, ModerationRequest request, CancellationToken cancellationToken);
        Task<object> Filters(CancellationToken cancellationToken);
        Task<Page<ContentDto>> Upcoming(Guid? categoryId, int page, int size, CancellationToken cancellationToken);
    }
}
