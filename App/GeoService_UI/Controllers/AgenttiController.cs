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
    /// Agentti
    /// </summary>
    /// 
    [FeatureGate(GeoServiceFeatureFlags.ApiAgentti)]
    [Authorize]
    public class AgenttiController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public AgenttiController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
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
                ResourceType = "Agentti", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        /********* Agentti ************/

        /// <summary>
        /// Get Agentti
        /// </summary>
        /// <returns>Agentti</returns>
        [HttpGet]
        [Route("api/Agentti/Read")]
        [Route("api/Agentti/Read/{id}")]
        public IActionResult GetAgentti(int? id)
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

                string query = "exec app.GetAgentti @riviavain, @roolit, @usercontext";
                var retval = db.Agentti.FromSqlRaw(query, riviavain, roolit, usercontext).ToList();
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
        /// Create Agentti
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Agentti/Create")]
        public IActionResult CreateAgentti([FromBody] Agentti agentti)
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
                { Value = agentti.ProjektiAvain };
                SqlParameter tyyppiavain = new SqlParameter("@tyyppiavain", System.Data.SqlDbType.Int)
                { Value = agentti.TyyppiAvain };
                SqlParameter agenttinimi = new SqlParameter("@agenttinimi", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)agentti.AgenttiNimi ?? DBNull.Value };
                SqlParameter osavain = new SqlParameter("@osavain", System.Data.SqlDbType.Int)
                { Value = agentti.OSAvain };
                SqlParameter cpu = new SqlParameter("@cpu", System.Data.SqlDbType.Int)
                { Value = agentti.CPU };
                SqlParameter cpuavain = new SqlParameter("@cpuavain", System.Data.SqlDbType.Int)
                { Value = agentti.CPUAvain };
                SqlParameter muisti = new SqlParameter("@muisti", System.Data.SqlDbType.Int)
                { Value = agentti.Muisti };
                SqlParameter levykoko = new SqlParameter("@levykoko", System.Data.SqlDbType.Int)
                { Value = agentti.Levykoko };
                SqlParameter gpu = new SqlParameter("@gpu", System.Data.SqlDbType.Int)
                { Value = agentti.GPU };
                SqlParameter gpuavain = new SqlParameter("@gpuavain", System.Data.SqlDbType.Int)
                { Value = agentti.GPUAvain };
                SqlParameter kuvaus = new SqlParameter("@kuvaus", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)agentti.Kuvaus ?? DBNull.Value };
                SqlParameter rekisterointiavain = new SqlParameter("@rekisterointiavain", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)agentti.RekisterointiAvain ?? DBNull.Value };
                SqlParameter syke = new SqlParameter("@syke", System.Data.SqlDbType.DateTime)
                { Value = (object)agentti.Syke ?? DBNull.Value };

                string query = "EXEC [app].[AddAgentti] @projektiavain, @tyyppiavain, @agenttinimi, @osavain, @cpu, @cpuavain, @muisti, @levykoko, @gpu, @gpuavain, @kuvaus, @rekisterointiavain, @syke, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, projektiavain, tyyppiavain, agenttinimi, osavain, cpu, cpuavain, muisti, levykoko, gpu, gpuavain, kuvaus, rekisterointiavain, syke, roolit, usercontext);
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
        /// Update Agentti
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Agentti/Update")]
        public IActionResult UpdateAgentti([FromBody] Agentti agentti)
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
                { Value = agentti.RiviAvain };
                SqlParameter projektiavain = new SqlParameter("@projektiavain", System.Data.SqlDbType.Int)
                { Value = agentti.ProjektiAvain };
                SqlParameter tyyppiavain = new SqlParameter("@tyyppiavain", System.Data.SqlDbType.Int)
                { Value = agentti.TyyppiAvain };
                SqlParameter agenttinimi = new SqlParameter("@agenttinimi", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)agentti.AgenttiNimi ?? DBNull.Value };
                SqlParameter osavain = new SqlParameter("@osavain", System.Data.SqlDbType.Int)
                { Value = agentti.OSAvain };
                SqlParameter cpu = new SqlParameter("@cpu", System.Data.SqlDbType.Int)
                { Value = agentti.CPU };
                SqlParameter cpuavain = new SqlParameter("@cpuavain", System.Data.SqlDbType.Int)
                { Value = agentti.CPUAvain };
                SqlParameter muisti = new SqlParameter("@muisti", System.Data.SqlDbType.Int)
                { Value = agentti.Muisti };
                SqlParameter levykoko = new SqlParameter("@levykoko", System.Data.SqlDbType.Int)
                { Value = agentti.Levykoko };
                SqlParameter gpu = new SqlParameter("@gpu", System.Data.SqlDbType.Int)
                { Value = agentti.GPU };
                SqlParameter gpuavain = new SqlParameter("@gpuavain", System.Data.SqlDbType.Int)
                { Value = agentti.GPUAvain };
                SqlParameter kuvaus = new SqlParameter("@kuvaus", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)agentti.Kuvaus ?? DBNull.Value };
                SqlParameter rekisterointiavain = new SqlParameter("@rekisterointiavain", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)agentti.RekisterointiAvain ?? DBNull.Value };
                SqlParameter syke = new SqlParameter("@syke", System.Data.SqlDbType.DateTime)
                { Value = (object)agentti.Syke ?? DBNull.Value };
                SqlParameter active = new SqlParameter("@active", System.Data.SqlDbType.Bit)
                { Value = agentti.Active };

                string query = "EXEC [app].[UpdateAgentti] @riviavain, @projektiavain, @tyyppiavain, @agenttinimi, @osavain, @cpu, @cpuavain, @muisti, @levykoko, @gpu, @gpuavain, @kuvaus, @rekisterointiavain, @syke, @active, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, riviavain, projektiavain, tyyppiavain, agenttinimi, osavain, cpu, cpuavain, muisti, levykoko, gpu, gpuavain, kuvaus, rekisterointiavain, syke, active, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { agentti.RiviAvain.ToString() };

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
        /// Delete Agentti
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpDelete]
        [Route("api/Agentti/Delete/{id}")]
        public IActionResult DeleteAgentti(int id)
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

                string query = "EXEC [app].[DeleteAgentti] @riviavain, @roolit, @usercontext";
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
