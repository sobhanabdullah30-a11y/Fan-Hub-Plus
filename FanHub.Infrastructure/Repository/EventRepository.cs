using AutoMapper;
using FanHub.Application.Common;
using FanHub.Application.DTOs.Content;
using FanHub.Application.DTOs.Event;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Domain.Entities;
using FanHub.Domain.Enums;

namespace FanHub.Infrastructure.Repository
{
    public class EventRepository : IEventRepository
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public EventRepository(IRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Page<ContentDto>> Events(EventFilter filter, CancellationToken cancellationToken)
        {
            RequestValidation.CheckPage(filter.Page, filter.PageSize);
            if (filter.Latitude.HasValue != filter.Longitude.HasValue)
            {
                throw new AppException(400, "Provide both latitude and longitude.");
            }

            var from = filter.From ?? DateTimeOffset.UtcNow;
            if (filter.To != null && filter.To < from)
            {
                throw new AppException(400, "To must follow From.");
            }

            var query = _repository.Query<Content>().Where(x => x.Type == ContentType.Event && x.Status == PublicationStatus.Published && (x.EndsAt ?? x.StartsAt) >= from);
            if (filter.To != null)
            {
                query = query.Where(x => x.StartsAt <= filter.To);
            }

            if (filter.City != null)
            {
                query = query.Where(x => x.City == filter.City);
            }

            if (filter.Latitude is double lat && filter.Longitude is double lon)
            {
                // Haversine great-circle distance, expressed in SQL-translatable Math functions.
                var rad = Math.PI / 180;
                var radius = filter.RadiusKm;
                query = query.Where(x => x.Latitude != null && x.Longitude != null && 12742 * Math.Asin(Math.Sqrt(Math.Pow(Math.Sin((x.Latitude.Value - lat) * rad / 2), 2) + Math.Cos(lat * rad) * Math.Cos(x.Latitude.Value * rad) * Math.Pow(Math.Sin((x.Longitude.Value - lon) * rad / 2), 2))) <= radius);
            }

            var total = await _repository.Count(query, cancellationToken);
            var rows = await _repository.List(query.OrderBy(x => x.StartsAt).ThenBy(x => x.Id).Skip((filter.Page - 1) * filter.PageSize).Take(filter.PageSize), cancellationToken);
            return new(rows.Select(_mapper.Map<ContentDto>).ToList(), total, filter.Page, filter.PageSize);
        }
    }
}
