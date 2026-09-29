namespace FanHub.Domain.Entities
{
    public class UserInterest : Entity
    {
        public Guid UserId { get; set; }
        public Guid CategoryId { get; set; }
    }
}
