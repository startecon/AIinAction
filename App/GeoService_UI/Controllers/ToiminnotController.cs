using GeoService_UI.Models;
using GeoService_UI.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Data.SqlClient;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Microsoft.FeatureManagement;
using Microsoft.FeatureManagement.Mvc;

namespace GeoService_UI.Controllers
{
    [FeatureGate(GeoServiceFeatureFlags.ApiToiminnot)]
    [Authorize]
    public class ToiminnotController : Controller
    {
        private readonly IFeatureManager featureManager;
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public ToiminnotController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
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
                ResourceType = "Toiminnot", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        /// <summary>
        /// Get Toiminnot
        /// </summary>
        /// <returns>Toiminnot</returns>
        [HttpGet]
        [Route("api/Toiminnot/Read")]
        [Route("api/Toiminnot/Read/{id}")]
        public IActionResult GetToiminnot(int? id)
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

                string query = "exec app.GetToiminnot @riviavain, @roolit, @usercontext";
                var retval = db.Toiminnot.FromSqlRaw(query, riviavain, roolit, usercontext).ToList();
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
            catch (Exception ex)
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }

        /// <summary>
        /// Get Toiminnot
        /// </summary>
        /// <returns>Toiminnot</returns>
        [HttpGet]
        [Route("api/Toiminto/Read")]
        [Route("api/Toiminto/Read/{id}")]
        public IActionResult GetToiminto(int? id)
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

                string query = "EXEC [app].[GetToiminto] @id, @roolit, @usercontext";
                var retval = db.Toiminnot.FromSqlRaw(query, _id, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.RiviAvain.ToString()).ToList();

                WriteLog(query, ids);

                return Ok(retval);
            }
            catch (SqlException ex)
            {
                return BadRequest(new { error = ex.ErrorCode, message = string.Join(";", ex.Errors) }); //TODO: Tietoturvariski palauttaa kaikki
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Create Toiminnot
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Toiminnot/Create")]
        public IActionResult CreateToiminnot([FromBody] Toiminnot toiminnot)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter paketti = new SqlParameter("@paketti", System.Data.SqlDbType.VarChar, 255)
                { Value = toiminnot.Paketti  };
                SqlParameter toiminto = new SqlParameter("@toiminto", System.Data.SqlDbType.VarChar, 255)
                { Value = toiminnot.Toiminto };
                SqlParameter aktivoitu = new SqlParameter("@aktivoitu", System.Data.SqlDbType.Int)
                { Value = (toiminnot.Aktivoitu == true ? 1 : 0) };

                string query = "EXEC [app].[AddToiminnot] @paketti, @toiminto, @aktivoitu, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, paketti, toiminto, aktivoitu, roolit, usercontext);
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
        /// Update Toiminnot
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Toiminnot/Update")]
        public IActionResult UpdateToiminnot([FromBody] Toiminnot toiminnot)
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
                { Value = toiminnot.RiviAvain };
                SqlParameter paketti = new SqlParameter("@paketti", System.Data.SqlDbType.VarChar, 255)
                { Value = toiminnot.Paketti };
                SqlParameter toiminto = new SqlParameter("@toiminto", System.Data.SqlDbType.VarChar, 255)
                { Value = toiminnot.Toiminto };
                SqlParameter aktivoitu = new SqlParameter("@aktivoitu", System.Data.SqlDbType.Bit)
                { Value = (toiminnot.Aktivoitu == true ? 1 : 0) };
                SqlParameter active = new SqlParameter("@active", System.Data.SqlDbType.Bit)
                { Value = toiminnot.Active };

                string query = "EXEC [app].[UpdateToiminnot] @riviavain, @paketti, @toiminto, @aktivoitu, @active, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, riviavain, paketti, toiminto, aktivoitu, active, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { toiminnot.RiviAvain.ToString() };

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
        /// Delete Toiminnot
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpDelete]
        [Route("api/Toiminnot/Delete/{id}")]
        public IActionResult DeleteToiminnot(int id)
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

                string query = "EXEC [app].[DeleteToiminnot] @riviavain, @roolit, @usercontext";
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
        /// Onko toiminto aktiivinen
        /// </summary>
        /// <returns>bool</returns>
        /// 
        [HttpGet]
        [Route("api/Toiminnot/IsActive/{featurename}")]
        public async Task<bool> IsActiveAsync(string featurename)
        {
            return await featureManager.IsEnabledAsync(featurename);
        }

        /// <summary>
        /// Aktivoi toiminto
        /// </summary>
        /// <returns>bool</returns>
        /// 
        [HttpGet]
        [Route("api/Toiminnot/Activate/{featurename}")]
        public IActionResult Activate(string featurename)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter toiminto = new SqlParameter("@toiminto", System.Data.SqlDbType.VarChar, 255)
                { Value = featurename };
                SqlParameter aktivoitu = new SqlParameter("@aktivoitu", System.Data.SqlDbType.Int)
                { Value = 1 };

                string query = "EXEC [app].[ToiminnotAktivointi] @toiminto, @aktivoitu, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, toiminto, aktivoitu, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { featurename };

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
        /// Deaktivoi toiminto
        /// </summary>
        /// <returns>bool</returns>
        /// 
        [HttpGet]
        [Route("api/Toiminnot/DeActivate/{featurename}")]
        public IActionResult DeActivate(string featurename)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter toiminto = new SqlParameter("@toiminto", System.Data.SqlDbType.VarChar, 255)
                { Value = featurename };
                SqlParameter aktivoitu = new SqlParameter("@aktivoitu", System.Data.SqlDbType.Int)
                { Value = 0 };

                string query = "EXEC [app].[ToiminnotAktivointi] @toiminto, @aktivoitu, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, toiminto, aktivoitu, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { featurename };

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
