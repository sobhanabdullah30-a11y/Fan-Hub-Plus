namespace FanHub.Domain.Entities
{
    public class Bookmark : Entity
    {
        public Guid UserId { get; set; }
        public Guid ContentId { get; set; }
        public string Note { get; set; } = "";
    }
}
