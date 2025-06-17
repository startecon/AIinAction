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
    [FeatureGate(GeoServiceFeatureFlags.ApiPalvelupakettiSisalto)]
    [Authorize]
    public class PalvelupakettiSisaltoController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public PalvelupakettiSisaltoController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
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
                ResourceType = "PalvelupakettiSisalto", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        [HttpGet]
        [Route("api/PalvelupakettiSisalto/Read")]
        [Route("api/PalvelupakettiSisalto/Read/{id}")]
        public IActionResult GetTehtava(int? id)
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

                string query = "EXEC [app].[GetPalvelupakettiSisalto] @id, @roolit, @usercontext";
                var retval = db.PalvelupakettiSisalto.FromSqlRaw(query, _id, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.PalvelupakettiSisaltoId.ToString()).ToList();

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
        [Route("api/PalvelupakettiSisalto/Create")]
        public IActionResult CreateTehtava([FromBody] PalvelupakettiSisalto sisalto)
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

                SqlParameter palvelupaketti_id = new SqlParameter("@palvelupaketti_id", System.Data.SqlDbType.Int)
                { Value = sisalto.Palvelupaketti_Id };
                SqlParameter toiminnot_id = new SqlParameter("@toiminnot_id", System.Data.SqlDbType.Int)
                { Value = sisalto.Toiminnot_Id };
                SqlParameter entiteetti_id = new SqlParameter("@entiteetti_id", System.Data.SqlDbType.Int)
                { Value = sisalto.Entiteetti_Id };
                SqlParameter maksimi = new SqlParameter("@maksimi", System.Data.SqlDbType.Int)
                { Value = (object)sisalto.Maksimi ?? DBNull.Value };

                string query = "EXEC [app].[AddPalvelupakettiSisalto] @palvelupaketti_id, @toiminnot_id, @entiteetti_id, @maksimi, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, palvelupaketti_id, toiminnot_id, entiteetti_id, maksimi, roolit, usercontext);
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

        [HttpPut]
        [Route("api/PalvelupakettiSisalto/Update")]
        public IActionResult UpdateTehtava([FromBody] PalvelupakettiSisalto sisalto)
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

                SqlParameter id = new SqlParameter("@id", System.Data.SqlDbType.Int)
                { Value = sisalto.PalvelupakettiSisaltoId };
                SqlParameter palvelupaketti_id = new SqlParameter("@palvelupakettiId", System.Data.SqlDbType.Int)
                { Value = sisalto.Palvelupaketti_Id };
                SqlParameter toiminnot_id = new SqlParameter("@toiminnotId", System.Data.SqlDbType.Int)
                { Value = sisalto.Toiminnot_Id };
                SqlParameter entiteetti_id = new SqlParameter("@entiteettiId", System.Data.SqlDbType.Int)
                { Value = sisalto.Entiteetti_Id };
                SqlParameter maksimi = new SqlParameter("@maksimi", System.Data.SqlDbType.Int)
                { Value = (object)sisalto.Maksimi ?? DBNull.Value };
                SqlParameter active = new SqlParameter("@active", System.Data.SqlDbType.Bit)
                { Value = (object)sisalto.Active ?? 1 };

                string query = "EXEC [app].[UpdatePalvelupakettiSisalto] @id, @palvelupakettiId, @toiminnotId, @entiteettiId, @maksimi, @active, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, id, palvelupaketti_id, toiminnot_id, entiteetti_id, maksimi, active, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { sisalto.PalvelupakettiSisaltoId.ToString() };

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
        [Route("api/PalvelupakettiSisalto/Delete/{id}")]
        public IActionResult DeleteTehtava(int id)
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
                { Value = id };

                string query = "EXEC [app].[DeletePalvelupakettiSisalto] @id, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, _id, roolit, usercontext);
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
