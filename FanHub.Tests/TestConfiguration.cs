using System.Security.Cryptography;
using AutoMapper;
using FanHub.Api.Configuration;
using FanHub.Application.MappingProfile.UserProfile;
using FanHub.Infrastructure;
using FanHub.Tests;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace FanHub.Tests
{
    internal static class TestConfiguration
    {
        public static IConfigurationRoot Create()
        {
            return new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Jwt:Key"] = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48)), ["Jwt:Issuer"] = "FanHub.Tests", ["Jwt:Audience"] = "FanHub.Tests.Client", ["Jwt:ExpiryInMinutes"] = "480", ["Cors:Origins:0"] = "https://frontend.example.test" }).Build();
        }

        public static IMapper CreateMapper()
        {
            var configuration = new MapperConfiguration(mapping => mapping.AddMaps(typeof(UserProfile).Assembly), NullLoggerFactory.Instance);
            configuration.AssertConfigurationIsValid();
            return configuration.CreateMapper();
        }
    }
}
