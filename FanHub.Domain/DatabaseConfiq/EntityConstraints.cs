namespace FanHub.Domain.DatabaseConfiq
{
    public static class EntityConstraints
    {
        public const int EmailLength = 254;
        public const int DisplayNameLength = 100;
        public const int PasswordHashLength = 512;
        public const int CategoryNameLength = 80;
        public const int ContentTitleLength = 200;
        public const int FandomLength = 100;
        public const int GenreLength = 100;
        public const int CityLength = 100;
        public const int TokenHashLength = 64;
        public const int TokenPurposeLength = 40;
        public const int MinimumRating = 1;
        public const int MaximumRating = 5;
    }
}
