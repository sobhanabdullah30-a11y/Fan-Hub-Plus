namespace FanHub.Application.Interface.ServiceInterface
{
    public interface IGenerativeAiService
    {
        Task<string?> GenerateResponse(string message, string knowledgeBase, CancellationToken cancellationToken);
    }
}
