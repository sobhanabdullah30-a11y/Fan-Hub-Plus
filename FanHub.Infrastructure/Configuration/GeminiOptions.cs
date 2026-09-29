namespace FanHub.Infrastructure.Configuration
{
    public class GeminiOptions
    {
        public const string SectionName = "Gemini";

        public string Model { get; set; } = "gemini-flash-lite-latest";
        public string ApiKey { get; set; } = "";
    }
}
