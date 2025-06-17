using System.Linq;
using System.IO;
using Microsoft.EntityFrameworkCore;
using System.Data.SqlClient;
using GeoService_UI.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using GeoService_UI.Utils;
using Microsoft.FeatureManagement.Mvc;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;

namespace GeoService_UI.Controllers
{
    [FeatureGate(GeoServiceFeatureFlags.ApiProsessitaulu)]
    [Authorize]
    public class ProsessiTauluController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public ProsessiTauluController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
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
                ResourceType = "ProsessiTaulu", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        [HttpPost]
        [Route("api/ProsessiTaulu/Read")]
        public IActionResult GetProsessiTaulu([FromBody] string suodatus)
        {
            try {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter suodatin = new SqlParameter("@suodatus", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)suodatus ?? DBNull.Value };

                string query = "EXEC [app].[GetProsessiTaulu] @suodatus, @roolit, @usercontext";
                var retval = db.ProsessiTaulu.FromSqlRaw(query, suodatin, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.TauluAvain.ToString()).ToList();

                WriteLog(query, ids);

                return Ok(retval);
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
        [Route("api/ProsessiTaulu/Update")]
        public IActionResult UpdateProsessiTaulu([FromBody] ProsessiTaulu taulu)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter taulujson = new SqlParameter("@taulujson", System.Data.SqlDbType.VarChar, 8000)
                { Value = taulu.TauluJSON };

                string query = "EXEC [app].[UpdateProsessiTaulu] @taulujson, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, taulujson, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { taulu.TauluAvain.ToString() };

                WriteLog(query, ids);

                return Ok(retval);
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
    }
}
