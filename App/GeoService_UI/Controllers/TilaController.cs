using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GeoService_UI.Models;
using System.Data.SqlClient;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GeoService_UI.Utils;
using Microsoft.Extensions.Configuration;
using Microsoft.FeatureManagement.Mvc;

namespace GeoService_UI.Controllers
{
    [FeatureGate(GeoServiceFeatureFlags.ApiTila)]
    [Authorize]
    public class TilaController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public TilaController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
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
                ResourceType = "Tila", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        [HttpGet]
        [Route("api/Tila/Read")]
        public IActionResult GetTila()
        {
            // Roolit ja usercontext
            string username = HttpContext.User.FindFirstValue("preferred_username");
            SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
            { Value = "ei_rooleja" };
            SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
            { Value = username };

            SqlParameter tilaavain = new SqlParameter("@tilaavain", System.Data.SqlDbType.Int)
            { Value = DBNull.Value };

            string query = "EXEC [app].[GetTila] @tilaavain, @roolit, @usercontext";
            var retval = db.Asiakas.FromSqlRaw(query, tilaavain, roolit, usercontext).ToList();
            var ids = retval.Select(x => x.RiviAvain.ToString()).ToList();

            WriteLog(query, ids);

            return Ok(retval);
        }

        [HttpPost]
        [Route("api/Tila/Create")]
        public IActionResult CreateTila([FromBody] Tila tila)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter tilanimi = new SqlParameter("@tilanimi", System.Data.SqlDbType.VarChar, 50)
                { Value = tila.Tilanimi };

                string query = "EXEC [app].[AddTila] @tilanimi, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, tilanimi, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { "-1" };

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
        [Route("api/Tila/Update")]
        public IActionResult UpdateTila([FromBody] Tila tila)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter tilaavain = new SqlParameter("@tilaavain", System.Data.SqlDbType.Int)
                { Value = tila.TilaAvain };
                SqlParameter tilanimi = new SqlParameter("@tilanimi", System.Data.SqlDbType.VarChar, 50)
                { Value = tila.Tilanimi };
                SqlParameter active = new SqlParameter("@active", System.Data.SqlDbType.Bit)
                { Value = tila.Active };

                string query = "EXEC [app].[UpdateTila] @tilaavain, @tilanimi, @active, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, tilaavain, tilanimi, active, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { tila.TilaAvain.ToString() };

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
        [HttpDelete]
        [Route("api/Tila/Delete/{id}")]
        public IActionResult DeleteTila(int id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };
                SqlParameter tilaavain = new SqlParameter("@tilaavain", System.Data.SqlDbType.Int)
                { Value = id };

                string query = "EXEC [app].[DeleteTila] @tilaavain, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, tilaavain, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { id.ToString() };

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
