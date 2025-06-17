using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Claims;
using GeoService_UI.Models;
using GeoService_UI.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Microsoft.FeatureManagement.Mvc;

namespace GeoService_UI.Controllers
{
    /// <summary>
    /// Tehtava
    /// </summary>
    /// 
    [FeatureGate(GeoServiceFeatureFlags.ApiTehtava)]
    [Authorize]
    public class TehtavaController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public TehtavaController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
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
                ResourceType = "Tehtava", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        /********* Tehtava ************/

        /// <summary>
        /// Get Tehtava
        /// </summary>
        /// <returns>Tehtava</returns>
        [HttpGet]
        [Route("api/Tehtava/Read")]
        [Route("api/Tehtava/Read/{id}")]
        public IActionResult GetTehtava(int? id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter riviavain = new SqlParameter("@riviavain", System.Data.SqlDbType.Int)
                { Value = (object)id ?? DBNull.Value };

                string query = "exec app.GetTehtava @riviavain, @roolit, @usercontext";
                var retval = db.Tehtava.FromSqlRaw(query, riviavain, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.RiviAvain.ToString()).ToList();

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

        /// <summary>
        /// Create Tehtava
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Tehtava/Create")]
        public IActionResult CreateTehtava([FromBody] Tehtava tehtava)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter projektiavain = new SqlParameter("@projektiavain", System.Data.SqlDbType.Int)
                { Value = tehtava.ProjektiAvain };
                SqlParameter tehtavanimi = new SqlParameter("@tehtavanimi", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)tehtava.TehtavaNimi ?? DBNull.Value };
                SqlParameter malli = new SqlParameter("@malli", System.Data.SqlDbType.Xml)
                { Value = (object)tehtava.Malli ?? DBNull.Value };
                SqlParameter tilaavain = new SqlParameter("@tilaavain", System.Data.SqlDbType.Int)
                { Value = tehtava.TilaAvain };
                SqlParameter rivitilaavain = new SqlParameter("@rivitilaavain", System.Data.SqlDbType.Int)
                { Value = tehtava.RiviTilaAvain };
                SqlParameter selite = new SqlParameter("@selite", System.Data.SqlDbType.VarChar, 500)
                { Value = (object)tehtava.Selite ?? DBNull.Value };

                string query = "EXEC [app].[AddTehtava] @projektiavain, @tehtavanimi, @malli, @tilaavain, @rivitilaavain, @selite, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, projektiavain, tehtavanimi, malli, tilaavain, rivitilaavain, selite, roolit, usercontext);
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

        /// <summary>
        /// Update Tehtava
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Tehtava/Update")]
        public IActionResult UpdateTehtava([FromBody] Tehtava tehtava)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter projektiavain = new SqlParameter("@projektiavain", System.Data.SqlDbType.Int)
                { Value = tehtava.ProjektiAvain };
                SqlParameter riviavain = new SqlParameter("@riviavain", System.Data.SqlDbType.Int)
                { Value = tehtava.RiviAvain };
                SqlParameter tehtavanimi = new SqlParameter("@tehtavanimi", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)tehtava.TehtavaNimi ?? DBNull.Value };
                SqlParameter malli = new SqlParameter("@malli", System.Data.SqlDbType.Xml)
                { Value = (object)tehtava.Malli ?? DBNull.Value };
                SqlParameter tilaavain = new SqlParameter("@tilaavain", System.Data.SqlDbType.Int)
                { Value = tehtava.TilaAvain };
                SqlParameter rivitilaavain = new SqlParameter("@rivitilaavain", System.Data.SqlDbType.Int)
                { Value = tehtava.RiviTilaAvain };
                SqlParameter selite = new SqlParameter("@selite", System.Data.SqlDbType.VarChar, 500)
                { Value = (object)tehtava.Selite ?? DBNull.Value };
                SqlParameter active = new SqlParameter("@active", System.Data.SqlDbType.Bit)
                { Value = tehtava.Active };

                string query = "EXEC [app].[UpdateTehtava] @riviavain, @projektiavain, @tehtavanimi, @malli, @tilaavain, @rivitilaavain, @selite, @active, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, riviavain, projektiavain, tehtavanimi, malli, tilaavain, rivitilaavain, selite, active, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { tehtava.RiviAvain.ToString() };

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

        /// <summary>
        /// Delete Tehtava
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpDelete]
        [Route("api/Tehtava/Delete/{id}")]
        public IActionResult DeleteTehtava(int id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter riviavain = new SqlParameter("@riviavain", System.Data.SqlDbType.Int)
                { Value = id };

                string query = "EXEC [app].[DeleteTehtava] @riviavain, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, riviavain, roolit, usercontext);
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
