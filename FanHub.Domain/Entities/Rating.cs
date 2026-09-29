namespace FanHub.Domain.Entities
{
    public class Rating : Entity
    {
        public Guid UserId { get; set; }
        public Guid ContentId { get; set; }
        public int Stars { get; set; }
        public string Comment { get; set; } = "";
    }
}
