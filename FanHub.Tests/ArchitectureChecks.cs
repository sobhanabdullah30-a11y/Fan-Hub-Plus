using AutoMapper;
using FanHub.Api.Configuration;
using FanHub.Api.Controllers;
using FanHub.Application.DTOs.User;
using FanHub.Application.Interface.RepositoryInterface;
using FanHub.Application.Interface.ServiceInterface;
using FanHub.Domain.DatabaseConfiq;
using FanHub.Domain.Entities;
using FanHub.Infrastructure;
using FanHub.Infrastructure.Repository;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace FanHub.Tests
{
    internal static class ArchitectureChecks
    {
        public static void Run(Action<bool, string> check, IHostEnvironment environment)
        {
            check(typeof(ApplicationDbContext).Assembly == typeof(Entity).Assembly, "reference layout places DbContext and entities in Domain");
            check(!typeof(Entity).Assembly.GetReferencedAssemblies().Any(reference => reference.Name!.StartsWith("FanHub.")), "Domain does not depend on outer project layers");
            check(!typeof(IAccountService).Assembly.GetReferencedAssemblies().Any(reference => reference.Name is "FanHub.Infrastructure" or "Fan-Hub"), "Application does not depend on implementation projects");
            var controllerDependencies = typeof(ApiController).Assembly.GetTypes().Where(type => type.IsSubclassOf(typeof(ApiController))).SelectMany(type => type.GetConstructors()).SelectMany(constructor => constructor.GetParameters());
            check(!controllerDependencies.Any(parameter => parameter.ParameterType.Assembly == typeof(EfRepository).Assembly), "controllers depend on service contracts");
            check(!typeof(IRepository).IsAssignableFrom(typeof(ApplicationDbContext)), "DbContext is separate from the repository contract");
            var mapper = TestConfiguration.CreateMapper();
            var user = new User
            {
                Email = "mapping@example.test",
                FavoriteFandoms = ["Anime"]
            };
            var userDto = mapper.Map<UserDto>(user);
            userDto.FavoriteFandoms.Add("Gaming");
            check(user.FavoriteFandoms.Count == 1, "AutoMapper user profile copies collections");
            check(typeof(UserDto).GetMethod("From") == null, "DTO definitions do not contain mapping logic");
            var configuration = TestConfiguration.Create();
            var services = new ServiceCollection();
            services.AddSingleton<IConfiguration>(configuration);
            services.AddSingleton(environment);
            services.AddLogging();
            services.AddInfrastructure(configuration);
            services.AddFanHubJwt(configuration, false);
            using var provider = services.BuildServiceProvider(new ServiceProviderOptions { ValidateOnBuild = true, ValidateScopes = true });
            using var scope = provider.CreateScope();
            foreach (var contract in typeof(IAccountService).Assembly.GetTypes().Where(type => type.IsInterface && type.Name.EndsWith("Service")))
            {
                check(scope.ServiceProvider.GetRequiredService(contract).GetType().Assembly == typeof(EfRepository).Assembly, "production DI resolves " + contract.Name + " from Infrastructure");
            }

            foreach (var contract in typeof(IRepository).Assembly.GetTypes().Where(type => type.IsInterface && type.Name.EndsWith("Repository")))
            {
                check(scope.ServiceProvider.GetRequiredService(contract).GetType().Assembly == typeof(EfRepository).Assembly, "production DI resolves " + contract.Name + " from Infrastructure");
            }
        }
    }
}
