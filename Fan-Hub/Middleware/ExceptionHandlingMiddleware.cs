using FanHub.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace FanHub.Api.Middleware
{
    public sealed class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (OperationCanceledException)when (context.RequestAborted.IsCancellationRequested)
            {
            }
            catch (Exception exception)when (!context.Response.HasStarted)
            {
                var statusCode = exception is AppException failure ? failure.Status : StatusCodes.Status500InternalServerError;
                if (statusCode == StatusCodes.Status500InternalServerError)
                {
                    _logger.LogError(exception, "Request failed: {TraceId}", context.TraceIdentifier);
                }

                context.Response.StatusCode = statusCode;
                await context.Response.WriteAsJsonAsync(new ProblemDetails { Status = statusCode, Title = statusCode == StatusCodes.Status500InternalServerError ? "An unexpected error occurred." : exception.Message, Extensions = { ["traceId"] = context.TraceIdentifier } });
            }
        }
    }
}
