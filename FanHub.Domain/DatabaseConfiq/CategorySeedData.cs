namespace FanHub.Domain.DatabaseConfiq
{
    public static class CategorySeedData
    {
        public static IReadOnlyList<CategorySeed> Categories { get; } = Array.AsReadOnly(new[] { "Anime", "Gaming", "Movies", "TV Shows", "K-Pop", "Comics", "Manga", "Cosplay" }.Select((name, index) => new CategorySeed(Guid.Parse($"10000000-0000-0000-0000-{index + 1:000000000000}"), name, name + " fandom content", new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero))).ToArray());
    }
}
