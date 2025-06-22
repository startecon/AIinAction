using Azure.Identity;
using GeoService_UI.Models;
using GeoService_UI.Utils;
using Microsoft.AspNetCore.Authentication.AzureAD.UI;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.FeatureManagement;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Marketplace.SaaS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI
{
    public class Startup
    {
        public IConfiguration Configuration { get; set; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton<IAzureLogs, AzureLogs>();
            services.AddApplicationInsightsTelemetry();
            services.AddControllers().AddNewtonsoftJson();
            services.AddHttpContextAccessor();
            services.AddLogging();

            //services.AddScoped<UserService>();
            //services.AddScoped<PowerBIService>();
            //services.Configure<PowerBI>(Configuration.GetSection("PowerBI"));



            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });

            services.AddDbContext<WebAppContext>(ServiceLifetime.Scoped);
            services.AddTransient<IDBAuthTokenService, AzureSqlAuthTokenService>();
            services.AddSingleton<IFeatureDefinitionProvider, GeoServiceFeatureDefinitionProvider>()
                .AddFeatureManagement();

            services.AddMicrosoftIdentityWebApiAuthentication(Configuration)
                .EnableTokenAcquisitionToCallDownstreamApi()
                .AddMicrosoftGraph(Configuration.GetSection("DownstreamApi"))
                .AddInMemoryTokenCaches();

            services.AddAuthentication(opts =>
            {
                opts.DefaultScheme = AzureADDefaults.AuthenticationScheme;
            })
                .AddJwtBearer("AzureAD", options =>
                {
                    options.Audience = Configuration.GetValue<string>("AzureAd:ClientId");
                    options.Authority = "https://login.microsoftonline.com/common/v2.0"; //Configuration.GetValue<string>("AzureAd:Instance") + Configuration.GetValue<string>("AzureAd:TenantId");

                    options.TokenValidationParameters = new TokenValidationParameters()
                    {
                        ValidIssuer = string.Format("https://login.microsoftonline.com/{0}/v2.0", Configuration.GetValue<string>("AzureAd:TenantId")),
                        ValidAudience = Configuration.GetValue<string>("AzureAd:ClientId")
                    };
                });

            var origs = new string[] { Configuration.GetValue<string>("AzureAd:CorsOrigin") };

            services.AddCors(o =>
                o.AddPolicy("CorsPolicy", builder =>
                {
                    builder.WithOrigins(origs)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                }));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseCors("CorsPolicy");

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                //Security Headers
                app.UseHsts(opts => opts.MaxAge(365).IncludeSubdomains().Preload());
            }
            //Security Headers
            app.UseReferrerPolicy(opts => opts.NoReferrerWhenDowngrade());
            /*app.UseCsp(opts => opts
                .BlockAllMixedContent()
                .StyleSources(s => s.Self())
                //.StyleSources(s => s.UnsafeInline()) TODO: Poppins fontit
                //.FontSources(s => s.Self()) TODO: Poppins fontit
                .FormActions(s => s.Self())
                .FrameAncestors(s => s.Self())
                .ImageSources(s => s.Self())
                .ScriptSources(s => s.Self())
                );*/
            //TODO:Upgrade Insecure Requests
            //TODO:Public-Key-Pins

            app.UseCookiePolicy(new CookiePolicyOptions
            {
                HttpOnly = HttpOnlyPolicy.Always,
                MinimumSameSitePolicy = SameSiteMode.Strict,
                Secure = CookieSecurePolicy.Always
            });

            //app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseRouting();

            //Security Headers
            app.UseNoCacheHttpHeaders();
            app.UseRedirectValidation();
            app.UseXfo(opts => opts.SameOrigin());
            app.UseXXssProtection(opts => opts.EnabledWithBlockMode());
            app.UseXContentTypeOptions();
            app.UseXDownloadOptions();
            app.UseXRobotsTag(opts => opts.NoIndex().NoFollow());

            app.UseAuthentication(); // before MVC
            app.UseAuthorization();
            app.UseEndpoints(opts => opts.MapControllers());

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
