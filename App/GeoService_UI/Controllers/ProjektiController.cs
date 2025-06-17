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
    /// Projekti
    /// </summary>
    /// 
    [FeatureGate(GeoServiceFeatureFlags.ApiProjekti)]
    [Authorize]
    public class ProjektiController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public ProjektiController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
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
                ResourceType = "Projekti", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        /********* Projekti ************/

        /// <summary>
        /// Get Projekti
        /// </summary>
        /// <returns>Projekti</returns>
        [HttpGet]
        [Route("api/Projekti/Read")]
        [Route("api/Projekti/Read/{id}")]
        public IActionResult GetProjekti(int? id)
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

                string query = "exec app.GetProjekti @riviavain, @roolit, @usercontext";
                var retval = db.Projekti.FromSqlRaw(query, riviavain, roolit, usercontext).ToList();
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
        /// Create Projekti
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Projekti/Create")]
        public IActionResult CreateProjekti([FromBody] Projekti projekti)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter asiakasavain = new SqlParameter("@asiakasavain", System.Data.SqlDbType.Int)
                { Value = projekti.AsiakasAvain };
                SqlParameter projektinimi = new SqlParameter("@projektinimi", System.Data.SqlDbType.VarChar, 255)
                { Value = projekti.ProjektiNimi };

                string query = "EXEC [app].[AddProjekti] @asiakasavain, @projektinimi, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, asiakasavain, projektinimi, roolit, usercontext);
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
        [Route("api/Projekti/CreateAddHoc")]
        public IActionResult CreateProjekti([FromBody] string projekti)
        {
            //TODO: Identity_insert on ja id mukaan
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                //TODO: Oletus asiakas pitää poimia käyttäjätiedoista, claims?
                SqlParameter asiakasavain = new SqlParameter("@asiakasavain", System.Data.SqlDbType.Int)
                { Value = 1 };
                SqlParameter projektinimi = new SqlParameter("@projektinimi", System.Data.SqlDbType.VarChar, 255)
                { Value = projekti };

                string query = "EXEC [app].[AddProjekti] @asiakasavain, @projektinimi, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, asiakasavain, projektinimi, roolit, usercontext);
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
        /// Update Projekti
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Projekti/Update")]
        public IActionResult UpdateProjekti([FromBody] Projekti projekti)
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
                { Value = projekti.RiviAvain };
                SqlParameter asiakasavain = new SqlParameter("@asiakasavain", System.Data.SqlDbType.Int)
                { Value = projekti.AsiakasAvain };
                SqlParameter projektinimi = new SqlParameter("@projektinimi", System.Data.SqlDbType.VarChar, 255)
                { Value = projekti.ProjektiNimi };
                SqlParameter active = new SqlParameter("@active", System.Data.SqlDbType.Bit)
                { Value = projekti.Active };


                string query = "EXEC [app].[UpdateProjekti] @riviavain, @asiakasavain, @projektinimi, @active, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, riviavain, asiakasavain, projektinimi, active, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { projekti.RiviAvain.ToString() };

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
        /// Delete Projekti
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpDelete]
        [Route("api/Projekti/Delete/{id}")]
        public IActionResult DeleteProjekti(int id)
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

                string query = "EXEC [app].[DeleteProjekti] @riviavain, @roolit, @usercontext";
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
