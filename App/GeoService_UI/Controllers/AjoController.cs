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
    /// Ajo
    /// </summary>
    /// 
    [FeatureGate(GeoServiceFeatureFlags.ApiAjo)]
    [Authorize]
    public class AjoController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public AjoController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
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
                ResourceType = "Ajo", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        /********* Ajo ************/

        /// <summary>
        /// Get Ajo
        /// </summary>
        /// <returns>Ajo</returns>
        [HttpGet]
        [Route("api/Ajo/Read")]
        [Route("api/Ajo/Read/{id}")]
        public IActionResult GetAjo(int? id)
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

                string query = "exec app.GetAjo @riviavain, @roolit, @usercontext";
                var retval = db.Ajo.FromSqlRaw(query, riviavain, roolit, usercontext).ToList();
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
        /// Create Ajo
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Ajo/Create")]
        public IActionResult CreateAjo([FromBody] Ajo ajo)
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
                { Value = ajo.TehtavaAvain };
                SqlParameter prioriteetti = new SqlParameter("@prioriteetti", System.Data.SqlDbType.Int)
                { Value = ajo.Prioriteetti };
                SqlParameter ajonimi = new SqlParameter("@ajonimi", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)ajo.AjoNimi ?? DBNull.Value };
                SqlParameter aloitus = new SqlParameter("@aloitus", System.Data.SqlDbType.DateTime)
                { Value = (object)ajo.Aloitus ?? DBNull.Value };
                SqlParameter lopetus = new SqlParameter("@lopetus", System.Data.SqlDbType.DateTime)
                { Value = (object)ajo.Lopetus ?? DBNull.Value };
                SqlParameter ajastettu = new SqlParameter("@ajastettu", System.Data.SqlDbType.Bit)
                { Value = (object)ajo.Ajastettu ?? DBNull.Value };
                SqlParameter rivitilaavain = new SqlParameter("@rivitilaavain", System.Data.SqlDbType.Int)
                { Value = ajo.RiviTilaAvain };
                SqlParameter selite = new SqlParameter("@selite", System.Data.SqlDbType.VarChar, 500)
                { Value = (object)ajo.Selite ?? DBNull.Value };

                string query = "EXEC [app].[AddAjo] @tehtavaavain, @prioriteetti, @ajonimi, @aloitus, @lopetus, @ajastettu, @rivitilaavain, @selite, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, tehtavaavain, prioriteetti, ajonimi, aloitus, lopetus, ajastettu, rivitilaavain, selite, roolit, usercontext);
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
        /// Update Ajo
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Ajo/Update")]
        public IActionResult UpdateAjo([FromBody] Ajo ajo)
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
                { Value = ajo.RiviAvain };
                SqlParameter tehtavaavain = new SqlParameter("@tehtavaavain", System.Data.SqlDbType.Int)
                { Value = ajo.TehtavaAvain };
                SqlParameter prioriteetti = new SqlParameter("@prioriteetti", System.Data.SqlDbType.Int)
                { Value = ajo.Prioriteetti };
                SqlParameter ajonimi = new SqlParameter("@ajonimi", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)ajo.AjoNimi ?? DBNull.Value };
                SqlParameter aloitus = new SqlParameter("@aloitus", System.Data.SqlDbType.DateTime)
                { Value = (object)ajo.Aloitus ?? DBNull.Value };
                SqlParameter lopetus = new SqlParameter("@lopetus", System.Data.SqlDbType.DateTime)
                { Value = (object)ajo.Lopetus ?? DBNull.Value };
                SqlParameter ajastettu = new SqlParameter("@ajastettu", System.Data.SqlDbType.Bit)
                { Value = (object)ajo.Ajastettu ?? DBNull.Value };
                SqlParameter rivitilaavain = new SqlParameter("@rivitilaavain", System.Data.SqlDbType.Int)
                { Value = ajo.RiviTilaAvain };
                SqlParameter selite = new SqlParameter("@selite", System.Data.SqlDbType.VarChar, 500)
                { Value = (object)ajo.Selite ?? DBNull.Value };
                SqlParameter active = new SqlParameter("@active", System.Data.SqlDbType.Bit)
                { Value = ajo.Active };

                string query = "EXEC [app].[UpdateAjo] @riviavain, @tehtavaavain, @prioriteetti, @ajonimi, @aloitus, @lopetus, @ajastettu, @rivitilaavain, @selite, @active, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, riviavain, tehtavaavain, prioriteetti, ajonimi, aloitus, lopetus, ajastettu, rivitilaavain, selite, active, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { ajo.RiviAvain.ToString() };

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
        /// Delete Ajo
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpDelete]
        [Route("api/Ajo/Delete/{id}")]
        public IActionResult DeleteAjo(int id)
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

                string query = "EXEC [app].[DeleteAjo] @riviavain, @roolit, @usercontext";
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
        /// Start Ajo
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpGet]
        [Route("api/Ajo/Kaynnista/{id}")]
        public IActionResult StartAjo(int id)
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
                { Value = id };

                string query = "EXEC [app].[StartAjo] @tehtavaavain, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, tehtavaavain, roolit, usercontext);
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
        /// Cancel Ajo
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpGet]
        [Route("api/Ajo/Peruuta/{id}")]
        public IActionResult CancelAjo(int id)
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
                { Value = id };

                string query = "EXEC [app].[StopAjo] @riviavain, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, tehtavaavain, roolit, usercontext);
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
        /// Schedule Ajo
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpGet]
        [Route("api/Ajo/Ajasta/{id}/{aloitus}/{aikavali}/{lopetus}")]
        public IActionResult StcheduleAjo(int id, string aloitus, int? aikavali, string lopetus)
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
                { Value = id };

                DateTime dtaloitus, dtlopetus;
                DateTime.TryParse(aloitus, out dtaloitus);

                SqlParameter aloitusparam = new SqlParameter("@aloitus", System.Data.SqlDbType.DateTime)
                { Value = (object)dtaloitus ?? DBNull.Value };

                DateTime.TryParse(lopetus, out dtlopetus);
                SqlParameter lopetusparam = (lopetus != "0" ? 
                    new SqlParameter("@lopetus", System.Data.SqlDbType.DateTime) { Value = dtlopetus} :
                    new SqlParameter("@lopetus", System.Data.SqlDbType.DateTime) { Value = DBNull.Value });

                SqlParameter aikavaliparam = new SqlParameter("@aikavali", System.Data.SqlDbType.Int)
                { Value = (object)(aikavali > 0 ? aikavali : null) ?? DBNull.Value };

                string query = "EXEC [app].[ScheduleAjo] @tehtavaavain, @aloitus, @lopetus, @aikavali, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, tehtavaavain, aloitusparam, lopetusparam, aikavaliparam, roolit, usercontext);
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
    }
}
