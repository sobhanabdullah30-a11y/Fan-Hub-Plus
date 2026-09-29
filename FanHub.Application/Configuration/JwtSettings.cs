namespace FanHub.Application.Configuration
{
    public class JwtSettings
    {
        public string Key { get; set; } = "";
        public string Issuer { get; set; } = "FanHub.Api";
        public string Audience { get; set; } = "FanHub.Client";
        public int ExpiryInMinutes { get; set; } = 480;
    }
}
