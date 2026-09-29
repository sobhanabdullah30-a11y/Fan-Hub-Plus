namespace FanHub.Domain.Entities
{
    public class Session : Entity
    {
        public Guid UserId { get; set; }
        public string TokenHash { get; set; } = "";
        public DateTimeOffset ExpiresAt { get; set; }
        public bool Revoked { get; set; }
    }
}
