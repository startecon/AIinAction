using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.FeatureManagement;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GeoService_UI.Utils
{
    public class GeoServiceFeatureDefinitionProvider : IFeatureDefinitionProvider
    {
        private IHttpContextAccessor httpContextAccessor;
        private IConfiguration configuration;
        private IDBAuthTokenService authTokenService;

        public GeoServiceFeatureDefinitionProvider(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            this.httpContextAccessor = httpContextAccessor;
            this.configuration = configuration;
            this.authTokenService = new AzureSqlAuthTokenService();
        }

        public async IAsyncEnumerable<FeatureDefinition> GetAllFeatureDefinitionsAsync()
        {
            List<FeatureDefinition> definitions = GetFeaturesFromDatabase();
            foreach (FeatureDefinition definition in definitions)
            {
                yield return definition;
            }
        }

        public Task<FeatureDefinition> GetFeatureDefinitionAsync(string featureName)
        {
            List<FeatureDefinition> definitions = GetFeaturesFromDatabase();
            return Task.FromResult(definitions.FirstOrDefault(definitions => definitions.Name.Equals(featureName, StringComparison.OrdinalIgnoreCase)));
        }

        private List<FeatureDefinition> GetFeaturesFromDatabase()
        {
            string username = "";
            string tenantId = "";
            string userId = "";

            //Features
            List<FeatureDefinition> featureDefinitions = new List<FeatureDefinition>();
            var alwaysOn = new List<FeatureFilterConfiguration>();
            alwaysOn.Add(new FeatureFilterConfiguration
            {
                Name = "AlwaysOn"
            });

            string connstring = configuration.GetConnectionString("DBString");

            using (SqlConnection connection = new SqlConnection(connstring))
            {
                //TODO:DEV
#if !DEBUG
                connection.AccessToken = authTokenService.GetToken().Result;
#endif 

                connection.Open();
                if (httpContextAccessor.HttpContext != null)
                {
                    tenantId = httpContextAccessor.HttpContext.User.FindFirstValue("http://schemas.microsoft.com/identity/claims/tenantid");
                    userId = httpContextAccessor.HttpContext.User.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier");
                    username = httpContextAccessor.HttpContext.User.FindFirstValue("preferred_username");
                }

                // Init session
                string qry = string.Format("EXEC sp_set_session_context @key=N'TenantId', @value='{0}'; EXEC sp_set_session_context @key=N'UserId', @value='{1}';", tenantId, userId);

                SqlCommand session_init = new SqlCommand(qry, connection);
                session_init.ExecuteNonQuery();

                // Toiminnot
                qry = string.Format("EXEC [app].[GetToiminnot] @riviavain = NULL, @roolit = 'ei_rooleja', @usercontext = '{0}' ", username);

                using (SqlCommand toiminnot = new SqlCommand(qry, connection))
                {
                    using (SqlDataReader reader = toiminnot.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            if (reader.GetBoolean(3) == true) //Aktivoitu
                            {
                                featureDefinitions.Add(new FeatureDefinition
                                {
                                    Name = reader.GetString(2), //Toiminto
                                    EnabledFor = alwaysOn
                                });
                            }
                            else
                            {
                                featureDefinitions.Add(new FeatureDefinition
                                {
                                    Name = reader.GetString(2) //Toiminto
                                });
                            }
                        }
                    }
                }
            }
            return featureDefinitions;
        }
    }
}
