using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using GeoService_UI.Models;
using GeoService_UI.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.FeatureManagement.Mvc;
using Newtonsoft.Json.Linq;

namespace GeoService_UI.Controllers
{
    [FeatureGate(GeoServiceFeatureFlags.ApiProfiili)]
    [Authorize]
    public class ProfiiliController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public ProfiiliController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
        {
            this.env = (configuration.GetValue<string>("APP_ENV") ?? "unknown").ToLower();
            this.logger = azureLogs;
            this.db = db;
            this.userService = userService;
        }

        private void WriteLog(string query, List<string> identities)
        {
            var post = new
            {
                operation_Id = Guid.NewGuid().ToString(),
                operation_ParentId = "",
                operation_Time = DateTime.Now,
                Application = "GeoService",
                Environment = env,
                PrincipalName = HttpContext.User.FindFirstValue("preferred_username"),
                PrincipalId = HttpContext.User.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier"),
                Host = HttpContext.Request.Host.ToString(),
                Path = HttpContext.Request.Path.ToString(),
                QueryString = query,
                RemoteIpAddress = HttpContext.Connection.RemoteIpAddress.ToString(),
                Identities = identities,
                ResourceType = "Profiili", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        [HttpGet]
        [Route("api/Profiili/Read")]
        public IActionResult GetProfiili()
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                string query = "EXEC [app].[GetProfiiliAsetus] @usercontext";
                var retval = db.Profiili.FromSqlRaw(query, usercontext).ToList();
                var ids = retval.Select(x => x.ProfiiliId.ToString()).ToList();

                WriteLog(query, ids);

                if (retval.Count > 0)
                {
                    return Ok(retval[0]);
                }
                else return null;
            }
            catch (SqlException ex)
            {
                if (ex.Class == 16) //Omat ilmoitukset
                {
                    return BadRequest(new { error = ex.State, message = ex.Message }); //4 = user, 5 = plan
                }
                else
                {
                    return BadRequest(new { error = 2, message = "ERROR" });
                }
            }
            catch
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }

        [HttpPost]
        [Route("api/Profiili/Update")]
        public bool UpdateProfiili([FromBody] ProfiiliKeyValuePair settings)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter _key = new SqlParameter("@key", System.Data.SqlDbType.VarChar, 8000) { Value = settings.Key };
                SqlParameter _value = new SqlParameter("@value", System.Data.SqlDbType.VarChar, 8000) { Value = settings.Value.Replace("\"\"", "\"") };

                db.Database.ExecuteSqlRaw("EXEC [app].[UpdateProfiiliAsetus] @key, @value, @roolit, @usercontext", _key, _value, roolit, usercontext);
                WriteLog(username, new List<string>() { "true" });

                return true;

            }
            catch
            {
                throw;
            }
        }
    }
}
