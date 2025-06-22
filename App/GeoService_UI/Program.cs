using Azure.Identity;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System;

namespace GeoService_UI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }
        //TODO:DEV
#if DEBUG       
        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(opts =>
            {
                opts.UseStartup<Startup>();
            });
#else
        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(opts =>
            {
                opts.UseStartup<Startup>()
                .ConfigureAppConfiguration((ctx, builder) =>
                {
                    //Build the config from sources we have
                    var config = builder.Build();

                    //Add Key Vault to configuration pipeline
                    builder.AddAzureKeyVault(new Uri(config["APP_KV"]), new DefaultAzureCredential());
                });
            });
#endif
    }
}
