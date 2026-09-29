namespace FanHub.Application.Common
{
    public static class RequestValidation
    {
        public static void CheckPage(int page, int size)
        {
            if (page < 1 || page > 100000 || size < 1 || size > 100)
            {
                throw new AppException(400, "Page must be 1-100000 and pageSize 1-100.");
            }
        }

        public static void CheckUrl(string? value)
        {
            if (value != null && (value.Length > 2000 || !Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme != "https" || !string.IsNullOrEmpty(uri.UserInfo)))
            {
                throw new AppException(400, "Media and ticket URLs must be absolute HTTPS URLs without credentials.");
            }
        }
    }
}
