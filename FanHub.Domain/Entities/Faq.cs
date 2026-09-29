namespace FanHub.Domain.Entities
{
    public class Faq : Entity
    {
        public string Question { get; set; } = "";
        public string Answer { get; set; } = "";
        public bool Published { get; set; } = true;
    }
}
