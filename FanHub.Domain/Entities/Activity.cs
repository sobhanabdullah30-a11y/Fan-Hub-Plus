namespace FanHub.Domain.Entities
{
    public class Activity : Entity
    {
        public Guid UserId { get; set; }
        public string Action { get; set; } = "";
        public Guid? ContentId { get; set; }
    }
}
