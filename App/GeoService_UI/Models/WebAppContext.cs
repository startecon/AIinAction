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

        public virtual DbSet<ProsessiTaulu> ProsessiTaulu { get; set; }
        public virtual DbSet<Profiili> Profiili { get; set; }
        public virtual DbSet<Rooli> Rooli { get; set; }
        public virtual DbSet<Roolit> Roolit { get; set; }
        public virtual DbSet<RooliOikeudet> RooliOikeudet { get; set; }
        public virtual DbSet<Entiteetit> Entiteetit { get; set; }
        public virtual DbSet<RooliPerProfiili> RooliPerProfiili { get; set; }
        public virtual DbSet<Koodi> Koodi { get; set; }
        public virtual DbSet<Koodiryhma> Koodiryhma { get; set; }
        public virtual DbSet<Tila> Tila { get; set; }
        public virtual DbSet<Tehtava> Tehtava { get; set; }
        public virtual DbSet<Projekti> Projekti { get; set; }
        public virtual DbSet<Asiakas> Asiakas { get; set; }
        public virtual DbSet<Ajo> Ajo { get; set; }
        public virtual DbSet<Agentti> Agentti { get; set; }
        public virtual DbSet<Ajastus> Ajastus { get; set; }
        public virtual DbSet<Toiminnot> Toiminnot { get; set; }
        public virtual DbSet<Palvelupaketti> Palvelupaketti { get; set; }
        public virtual DbSet<PalvelupakettiSisalto> PalvelupakettiSisalto { get; set; }
        public virtual DbSet<Tilaus> Tilaus { get; set; }
        public virtual DbSet<Lokitus> Lokitus { get; set; }
        public virtual DbSet<CarbonFootprint> CarbonFootprint { get; set; }
        public virtual DbSet<BoxAndWhisker> BoxAndWhisker { get; set; }
        public virtual DbSet<Raportti> Raportti { get; set; }

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
            modelBuilder.HasAnnotation("ProductVersion", "2.2.6-servicing-10079");

            modelBuilder.Entity<Profiili>(entity =>
            {
                entity.Property(e => e.ProfiiliId).HasColumnName("ProfiiliId");
            });

            modelBuilder.Entity<Rooli>(entity =>
            {
                entity.Property(e => e.RooliId).HasColumnName("RooliId");
            });

            modelBuilder.Entity<Roolit>(entity =>
            {
                entity.Property(e => e.RoolitId).HasColumnName("RoolitId");
            });

            modelBuilder.Entity<RooliOikeudet>(entity =>
            {
                entity.Property(e => e.RooliOikeudetId).HasColumnName("RooliOikeudetId");
            });

            modelBuilder.Entity<Entiteetit>(entity =>
            {
                entity.Property(e => e.EntiteettiId).HasColumnName("EntiteettiId");
            });

            modelBuilder.Entity<RooliPerProfiili>(entity =>
            {
                entity.Property(e => e.RoolitId).HasColumnName("RoolitId");
            });

            modelBuilder.Entity<Koodi>(entity =>
            {
                entity.Property(e => e.KoodiAvain).HasColumnName("KoodiAvain");
            });

            modelBuilder.Entity<Koodiryhma>(entity =>
            {
                entity.Property(e => e.KoodiryhmaAvain).HasColumnName("KoodiryhmaAvain");
            });

            modelBuilder.Entity<ProsessiTaulu>(entity =>
            {
                entity.Property(e => e.TauluAvain).HasColumnName("TauluAvain");
            });

            modelBuilder.Entity<Tila>(entity =>
            {
                entity.Property(e => e.TilaAvain).HasColumnName("TilaAvain");
            });

            modelBuilder.Entity<Tehtava>(entity =>
            {
                entity.Property(e => e.RiviAvain).HasColumnName("RiviAvain");
            });

            modelBuilder.Entity<Projekti>(entity =>
            {
                entity.Property(e => e.RiviAvain).HasColumnName("RiviAvain");
            });

            modelBuilder.Entity<Asiakas>(entity =>
            {
                entity.Property(e => e.RiviAvain).HasColumnName("RiviAvain");
            });

            modelBuilder.Entity<Ajo>(entity =>
            {
                entity.Property(e => e.RiviAvain).HasColumnName("RiviAvain");
            });

            modelBuilder.Entity<Agentti>(entity =>
            {
                entity.Property(e => e.RiviAvain).HasColumnName("RiviAvain");
            });

            modelBuilder.Entity<Ajastus>(entity =>
            {
                entity.Property(e => e.RiviAvain).HasColumnName("RiviAvain");
            });

            modelBuilder.Entity<Toiminnot>(entity =>
            {
                entity.Property(e => e.RiviAvain).HasColumnName("RiviAvain");
            });

            modelBuilder.Entity<Palvelupaketti>(entity =>
            {
                entity.Property(e => e.PalvelupakettiId).HasColumnName("PalvelupakettiId");
            });

            modelBuilder.Entity<PalvelupakettiSisalto>(entity =>
            {
                entity.Property(e => e.PalvelupakettiSisaltoId).HasColumnName("PalvelupakettiSisaltoId");
            });

            modelBuilder.Entity<Tilaus>(entity =>
            {
                entity.Property(e => e.RowId).HasColumnName("RowId");
            });

            modelBuilder.Entity<Lokitus>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("Id");
            });

            modelBuilder.Entity<CarbonFootprint>(entity =>
            {
                entity.Property(e => e.RiviAvain).HasColumnName("RiviAvain");
            });

            modelBuilder.Entity<BoxAndWhisker>(entity =>
            {
                entity.Property(e => e.Id).HasColumnName("Id");
            });

            modelBuilder.Entity<Raportti>(entity =>
            {
                entity.Property(e => e.RiviAvain).HasColumnName("RiviAvain");
            });
        }
    }
}
