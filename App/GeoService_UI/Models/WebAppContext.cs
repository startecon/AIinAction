using System;
using System.Data.SqlClient;
using GeoService_UI.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.Data;

namespace GeoService_UI.Models
{
    public partial class WebAppContext : DbContext
    {
        private string tenantId;
        private string usercontext;
        public IConfiguration Configuration { get; }
        public IDBAuthTokenService authTokenService { get; set; }

        public WebAppContext(DbContextOptions<WebAppContext> options,
            IHttpContextAccessor httpContextAccessor,
            IConfiguration configuration,
            IDBAuthTokenService authTokenService) : base(options)
        {
            Configuration = configuration; // Startup.Configuration;
            this.authTokenService = authTokenService;
            if (httpContextAccessor.HttpContext != null)
            {
                this.tenantId = httpContextAccessor.HttpContext.User.FindFirstValue("http://schemas.microsoft.com/identity/claims/tenantid");
                this.usercontext = httpContextAccessor.HttpContext.User.FindFirstValue("preferred_username");
            }
        }

        public virtual DbSet<BoxAndWhisker> BoxAndWhisker { get; set; }
        public virtual DbSet<Toiminnot> Toiminnot { get; set; }
        public virtual DbSet<RooliPerProfiili> RooliPerProfiili { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            SqlConnection connection = new SqlConnection();
            connection.ConnectionString = Configuration.GetConnectionString("DBString");
            //TODO:DEV
#if !DEBUG
            connection.AccessToken = authTokenService.GetToken().Result;
#endif            

            // Security Context
            connection.StateChange += (sender, e) =>
            {
                if (e.CurrentState == ConnectionState.Open)
                {
                    var cmd = connection.CreateCommand();
                    cmd.CommandText = @"EXEC sp_set_session_context @key=N'TenantId', @value=@TenantId";
                    cmd.Parameters.AddWithValue("@TenantId", this.tenantId);
                    cmd.ExecuteNonQuery();
                }
            };

            optionsBuilder.UseSqlServer(connection, options => options.EnableRetryOnFailure());
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BoxAndWhisker>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("Id");
            });

            modelBuilder.Entity<Toiminnot>(entity =>
            {
                entity.Property(e => e.RiviAvain).HasColumnName("RiviAvain");
            });

            modelBuilder.Entity<RooliPerProfiili>(entity =>
            {
                entity.Property(e => e.RoolitId).HasColumnName("RoolitId");
            });
        }
    }
}
