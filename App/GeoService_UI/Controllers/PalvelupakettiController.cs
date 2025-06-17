using System.Linq;
using Microsoft.AspNetCore.Mvc;
using GeoService_UI.Models;
using Microsoft.EntityFrameworkCore;
using System.Data.SqlClient;
using System;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GeoService_UI.Utils;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using Microsoft.FeatureManagement.Mvc;

namespace GeoService_UI.Controllers
{
    [FeatureGate(GeoServiceFeatureFlags.ApiPalvelupaketti)]
    [Authorize]
    public class PalvelupakettiController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public PalvelupakettiController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
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
                ResourceType = "Palvelupaketti", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        [HttpGet]
        [Route("api/Palvelupaketti/Read")]
        [Route("api/Palvelupaketti/Read/{id}")]
        public IActionResult GetPalvelupaketti(int? id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                string roles = string.Join(";", userService.GetRolesByUser());

                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = roles };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter _id = new SqlParameter("@id", System.Data.SqlDbType.Int)
                { Value = (object)id ?? DBNull.Value };

                string query = "EXEC [app].[GetPalvelupaketti] @id, @roolit, @usercontext";
                var retval = db.Palvelupaketti.FromSqlRaw(query, _id, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.PalvelupakettiId.ToString()).ToList();

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
