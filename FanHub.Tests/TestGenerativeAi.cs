using FanHub.Application.Interface.ServiceInterface;

sealed class TestGenerativeAi : IGenerativeAiService
{
    public Task<string?> GenerateResponse(
        string message,
        string knowledgeBase,
        CancellationToken cancellationToken)
    {
        return Task.FromResult<string?>(null);
    }
}
