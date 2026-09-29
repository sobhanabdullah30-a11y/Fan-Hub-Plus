namespace FanHub.Domain.Entities
{
    public class AccountToken : Entity
    {
        public Guid UserId { get; set; }
        public string TokenHash { get; set; } = "";
        public string Purpose { get; set; } = "";
        public DateTimeOffset ExpiresAt { get; set; }
        public bool Used { get; set; }
    }
}
