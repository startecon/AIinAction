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
using System.Globalization;
using Microsoft.FeatureManagement.Mvc;

namespace GeoService_UI.Controllers
{
    /// <summary>
    /// Ajastus
    /// </summary>
    /// 
    [FeatureGate(GeoServiceFeatureFlags.ApiAjastus)]
    [Authorize]
    public class AjastusController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public AjastusController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
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
                ResourceType = "Ajastus", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        /********* Ajastus ************/

        /// <summary>
        /// Get Ajastus
        /// </summary>
        /// <returns>Ajastus</returns>
        [HttpGet]
        [Route("api/Ajastus/Read")]
        [Route("api/Ajastus/Read/{id}")]
        public IActionResult GetAjastus(int? id)
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

                string query = "exec app.GetAjastus @riviavain, @roolit, @usercontext";
                var retval = db.Ajastus.FromSqlRaw(query, riviavain, roolit, usercontext).ToList();
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
        /// Create Ajastus
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Ajastus/Create")]
        public IActionResult CreateAjastus([FromBody] Ajastus ajastus)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter tehtavaavain = new SqlParameter("@tehtavaavain", System.Data.SqlDbType.Int)
                { Value = ajastus.TehtavaAvain };
                SqlParameter aloitus = new SqlParameter("@aloitus", System.Data.SqlDbType.DateTime)
                { Value = (object)ajastus.Aloitus ?? DBNull.Value };
                SqlParameter lopetus = new SqlParameter("@lopetus", System.Data.SqlDbType.DateTime)
                { Value = (object)ajastus.Lopetus ?? DBNull.Value };
                SqlParameter seuraava = new SqlParameter("@seuraava", System.Data.SqlDbType.DateTime)
                { Value = (object)ajastus.Seuraava ?? DBNull.Value };
                SqlParameter edellinen = new SqlParameter("@edellinen", System.Data.SqlDbType.DateTime)
                { Value = (object)ajastus.Edellinen ?? DBNull.Value };
                SqlParameter toistuva = new SqlParameter("@toistuva", System.Data.SqlDbType.Bit)
                { Value = (object)ajastus.Toistuva ?? DBNull.Value };
                SqlParameter aikavali = new SqlParameter("@aikavali", System.Data.SqlDbType.Int)
                { Value = (object)ajastus.Aikavali ?? DBNull.Value };

                string query = "EXEC [app].[AddAjastus] @tehtavaavain, @aloitus, @lopetus, @seuraava, @edellinen, @toistuva, @aikavali, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, tehtavaavain, aloitus, lopetus, seuraava, edellinen, toistuva, aikavali, roolit, usercontext);
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
        /// Update Ajastus
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Ajastus/Update")]
        public IActionResult UpdateAjastus([FromBody] Ajastus ajastus)
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
                { Value = ajastus.RiviAvain };
                SqlParameter tehtavaavain = new SqlParameter("@tehtavaavain", System.Data.SqlDbType.Int)
                { Value = ajastus.TehtavaAvain };
                SqlParameter aloitus = new SqlParameter("@aloitus", System.Data.SqlDbType.DateTime)
                { Value = (object)ajastus.Aloitus ?? DBNull.Value };
                SqlParameter lopetus = new SqlParameter("@lopetus", System.Data.SqlDbType.DateTime)
                { Value = (object)ajastus.Lopetus ?? DBNull.Value };
                SqlParameter seuraava = new SqlParameter("@seuraava", System.Data.SqlDbType.DateTime)
                { Value = (object)ajastus.Seuraava ?? DBNull.Value };
                SqlParameter edellinen = new SqlParameter("@edellinen", System.Data.SqlDbType.DateTime)
                { Value = (object)ajastus.Edellinen ?? DBNull.Value };
                SqlParameter toistuva = new SqlParameter("@toistuva", System.Data.SqlDbType.Bit)
                { Value = (object)ajastus.Toistuva ?? DBNull.Value };
                SqlParameter aikavali = new SqlParameter("@aikavali", System.Data.SqlDbType.Int)
                { Value = (object)ajastus.Aikavali ?? DBNull.Value };
                SqlParameter active = new SqlParameter("@active", System.Data.SqlDbType.Bit)
                { Value = ajastus.Active };

                string query = "EXEC [app].[UpdateAjastus] @riviavain, @tehtavaavain, @aloitus, @lopetus, @seuraava, @edellinen, @toistuva, @aikavali, @active, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, riviavain, tehtavaavain, aloitus, lopetus, seuraava, edellinen, toistuva, aikavali, active, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { ajastus.RiviAvain.ToString() };

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
        /// Delete Ajastus
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpDelete]
        [Route("api/Ajastus/Delete/{id}")]
        public IActionResult DeleteAjastus(int id)
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

                string query = "EXEC[app].[DeleteAjastus] @riviavain, @roolit, @usercontext";
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

        /// <summary>
        /// Get Ajastus
        /// </summary>
        /// <returns>Ajastus</returns>
        [HttpGet]
        [Route("api/Ajastus/Ajo/Read/{id}")]
        public IActionResult GetAjoAjastus(int id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter tehtavaavain = new SqlParameter("@tehtavaavain", System.Data.SqlDbType.Int)
                { Value = id};

                string query = "exec app.GetAjoAjastus @tehtavaavain, @roolit, @usercontext";
                var retval = db.Ajastus.FromSqlRaw(query, tehtavaavain, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.TehtavaAvain.ToString()).ToList();

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
