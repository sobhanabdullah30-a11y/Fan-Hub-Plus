using System.Net.Http.Json;
using System.Text.Json;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Infrastructure.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FanHub.Infrastructure.Service
{
    public class GeminiChatService : IGenerativeAiService
    {
        private const string AssistantInstructions = """
            You are Fan Guide, the helpful in-app assistant for Fan Hub Plus, a fandom discovery platform.
            Help members discover content, use bookmarks, submit stories, join events, manage their profiles, and contact the team.
            Use the supplied platform knowledge when it answers the question. Do not invent account data, event availability, or platform features.
            Keep responses friendly, practical, and under 150 words.
            """;

        private readonly HttpClient _httpClient;
        private readonly GeminiOptions _options;
        private readonly ILogger<GeminiChatService> _logger;

        public GeminiChatService(
            HttpClient httpClient,
            IOptions<GeminiOptions> options,
            ILogger<GeminiChatService> logger)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _logger = logger;
        }

        public async Task<string?> GenerateResponse(string message, string knowledgeBase, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(_options.ApiKey))
            {
                return null;
            }

            var model = string.IsNullOrWhiteSpace(_options.Model)
                ? "gemini-3.5-flash-lite"
                : _options.Model.Trim();

            using var request = new HttpRequestMessage(HttpMethod.Post, $"v1beta/models/{Uri.EscapeDataString(model)}:generateContent");
            request.Headers.Add("x-goog-api-key", _options.ApiKey);
            request.Content = JsonContent.Create(new
            {
                systemInstruction = new
                {
                    parts = new[] { new { text = $"{AssistantInstructions}\n\nPlatform knowledge:\n{knowledgeBase}" } }
                },
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = message.Trim() } }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.35,
                    maxOutputTokens = 320
                }
            });

            try
            {
                using var response = await _httpClient.SendAsync(request, cancellationToken);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Gemini request failed with status code {StatusCode}.", (int)response.StatusCode);
                    return null;
                }

                await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
                using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
                return ReadResponseText(document.RootElement);
            }
            catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning("Gemini request timed out.");
                return null;
            }
            catch (HttpRequestException exception)
            {
                _logger.LogWarning(exception, "Gemini request could not be completed.");
                return null;
            }
            catch (JsonException exception)
            {
                _logger.LogWarning(exception, "Gemini returned an unexpected response format.");
                return null;
            }
        }

        private static string? ReadResponseText(JsonElement root)
        {
            if (!root.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            {
                return null;
            }

            if (!candidates[0].TryGetProperty("content", out var content)
                || !content.TryGetProperty("parts", out var parts)
                || parts.ValueKind != JsonValueKind.Array)
            {
                return null;
            }

            var response = string.Concat(parts.EnumerateArray()
                .Where(part => part.TryGetProperty("text", out _))
                .Select(part => part.GetProperty("text").GetString()));

            return string.IsNullOrWhiteSpace(response) ? null : response.Trim();
        }
    }
}
