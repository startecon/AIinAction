using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Claims;
using GeoService_UI.Models;
using GeoService_UI.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.FeatureManagement.Mvc;

namespace GeoService_UI.Controllers
{
    /// <summary>
    /// Roolit
    /// - Profiilin hallinta
    /// - Roolin hallinta
    /// - Roolioikeuksien hallinta
    /// - Entiteettien hallinta
    /// </summary>

    [FeatureGate(GeoServiceFeatureFlags.ApiRoolit)]
    [Authorize]
    public class RoolitController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public RoolitController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
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
                ResourceType = "Roolit", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        /* Profiili */

        /// <summary>
        /// Get Profiili
        /// </summary>
        /// <returns></returns>

        [HttpGet]
        [Route("api/Roolit/Profiili/Read")]
        public IActionResult GetProfiili()
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter profiiliId = new SqlParameter("@ProfiiliId", System.Data.SqlDbType.Int)
                { Value = DBNull.Value };

                string query = "exec app.GetProfiili @ProfiiliId, @roolit, @usercontext";
                var retval = db.Profiili.FromSqlRaw(query, profiiliId, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.ProfiiliId.ToString()).ToList();

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
        /// Create Profiili
        /// </summary>
        /// <returns></returns>
        /// 
        [HttpPost]
        [Route("api/Roolit/Profiili/Create")]
        public IActionResult CreateProfiili([FromBody] Profiili profiili)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter profiilinimi = new SqlParameter("@username", System.Data.SqlDbType.NVarChar, 255)
                { Value = profiili.Username };
                SqlParameter ui_settings = new SqlParameter("@ui_settings", System.Data.SqlDbType.VarChar, 8000)
                { Value = profiili.UI_Settings };
                SqlParameter default_toimeksiantaja_id = new SqlParameter("@default_toimeksiantaja_id", System.Data.SqlDbType.Int)
                { Value = profiili.AsiakasAvain };

                string query = "EXEC [app].[AddProfiili] @username, @ui_settings, @default_toimeksiantaja_id, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, profiilinimi, ui_settings, default_toimeksiantaja_id, roolit, usercontext);
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
        [Route("api/Roolit/Profiili/CreateAddHoc")]
        public IActionResult CreateProfiili([FromBody] string profiili)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter profiilinimi = new SqlParameter("@username", System.Data.SqlDbType.NVarChar, 255)
                { Value = profiili };
                SqlParameter ui_settings = new SqlParameter("@ui_settings", System.Data.SqlDbType.VarChar, 8000)
                { Value = "{ columns: {}}" };
                SqlParameter default_toimeksiantaja_id = new SqlParameter("@default_toimeksiantaja_id", System.Data.SqlDbType.Int)
                { Value = 1 };

                string query = "EXEC [app].[AddProfiili] @username, @ui_settings, @default_toimeksiantaja_id, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, profiilinimi, ui_settings, default_toimeksiantaja_id, roolit, usercontext);
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
        /// Update Profiili
        /// </summary>
        /// <returns></returns>
        /// 
        [HttpPost]
        [Route("api/Roolit/Profiili/Update")]
        public IActionResult UpdateProfiili([FromBody] Profiili profiili)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter profiiliId = new SqlParameter("@ProfiiliId", System.Data.SqlDbType.Int)
                { Value = profiili.ProfiiliId };
                SqlParameter profiilinimi = new SqlParameter("@username", System.Data.SqlDbType.NVarChar, 255)
                { Value = profiili.Username };
                SqlParameter ui_settings = new SqlParameter("@ui_settings", System.Data.SqlDbType.VarChar, 8000)
                { Value = profiili.UI_Settings };
                SqlParameter default_toimeksiantaja_id = new SqlParameter("@default_toimeksiantaja_id", System.Data.SqlDbType.Int)
                { Value = profiili.AsiakasAvain };


                string query = "EXEC [app].[UpdateProfiili] @profiiliid, @username, @ui_settings, @default_toimeksiantaja_id, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, profiiliId, profiilinimi, ui_settings, default_toimeksiantaja_id, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { profiili.ProfiiliId.ToString() };

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
        /// Delete Profiili
        /// </summary>
        /// <returns></returns>
        /// 
        [HttpDelete]
        [Route("api/Roolit/Profiili/Delete/{id}")]
        public IActionResult DeleteProfiili(int id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter profiiliId = new SqlParameter("@ProfiiliId", System.Data.SqlDbType.Int)
                { Value = id };

                string query = "EXEC [app].[DeleteProfiili] @ProfiiliId, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, profiiliId, roolit, usercontext);
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

        /********* Rooli ************/

        /// <summary>
        /// Get Rooli
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/Roolit/Rooli/Read")]
        public IActionResult GetRooli()
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter rooliId = new SqlParameter("@rooliId", System.Data.SqlDbType.Int)
                { Value = DBNull.Value };


                string query = "exec app.GetRooli @rooliId, @roolit, @usercontext";
                var retval = db.Rooli.FromSqlRaw(query, rooliId, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.RooliId.ToString()).ToList();

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
        /// Create Rooli
        /// </summary>
        /// <returns></returns>
        /// 
        [HttpPost]
        [Route("api/Roolit/Rooli/Create")]
        public IActionResult CreateRooli([FromBody] Rooli rooli)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter rooliNimi = new SqlParameter("@rooli", System.Data.SqlDbType.NVarChar, 255)
                { Value = rooli.RooliNimi };

                string query = "EXEC [app].[AddRooli] @rooli, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, rooliNimi, roolit, usercontext);
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
        [Route("api/Roolit/Rooli/CreateAddHoc")]
        public IActionResult CreateRooli([FromBody] string rooli)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter rooliNimi = new SqlParameter("@rooli", System.Data.SqlDbType.NVarChar, 255)
                { Value = rooli };

                string query = "EXEC [app].[AddRooli] @rooli, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, rooliNimi, roolit, usercontext);
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
        /// Update Rooli
        /// </summary>
        /// <returns></returns>
        /// 
        [HttpPost]
        [Route("api/Roolit/Rooli/Update")]
        public IActionResult UpdateRooli([FromBody] Rooli rooli)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter rooliId = new SqlParameter("@rooliId", System.Data.SqlDbType.Int)
                { Value = rooli.RooliId };
                SqlParameter rooliNimi = new SqlParameter("@rooli", System.Data.SqlDbType.NVarChar, 255)
                { Value = rooli.RooliNimi };
                SqlParameter active = new SqlParameter("@Active", System.Data.SqlDbType.Bit)
                { Value = rooli.Active };

                string query = "EXEC [app].[UpdateRooli] @rooliId, @rooli, @Active, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, rooliId, rooliNimi, active, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { rooli.RooliId.ToString() };

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
        /// Delete Rooli
        /// </summary>
        /// <returns></returns>
        /// 
        [HttpDelete]
        [Route("api/Roolit/Rooli/Delete/{id}")]
        public IActionResult DeleteRooli(int id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter rooliId = new SqlParameter("@rooliId", System.Data.SqlDbType.Int)
                { Value = id };

                string query = "EXEC [app].[DeleteRooli] @rooliId, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, rooliId, roolit, usercontext);
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

        /*********** Roolit ******/

        /// <summary>
        /// Get Roolit
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/Roolit/Roolit/Read")]
        public IActionResult GetRoolit()
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter roolitId = new SqlParameter("@roolitId", System.Data.SqlDbType.Int)
                { Value = DBNull.Value };

                string query = "exec app.GetRoolit @roolitId, @roolit, @usercontext";
                var retval = db.Roolit.FromSqlRaw(query, roolitId, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.RoolitId.ToString()).ToList();

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
        /// Create Roolit
        /// </summary>
        /// <returns></returns>
        /// 
        [HttpPost]
        [Route("api/Roolit/Roolit/Create")]
        public IActionResult CreateRoolit([FromBody] Roolit rooli)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter rooliId = new SqlParameter("@rooliId", System.Data.SqlDbType.Int)
                { Value = rooli.Rooli_Id };
                SqlParameter profiiliId = new SqlParameter("@profiiliId", System.Data.SqlDbType.Int)
                { Value = rooli.Profiili_Id };

                string query = "EXEC [app].[AddRoolit] @rooliId, @profiiliId, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, rooliId, profiiliId, roolit, usercontext);
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
        /// Update Roolit
        /// </summary>
        /// <returns></returns>
        /// 
        [HttpPost]
        [Route("api/Roolit/Roolit/Update")]
        public IActionResult UpdateRoolit([FromBody] Roolit rooli)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter roolitId = new SqlParameter("@roolitId", System.Data.SqlDbType.Int)
                { Value = rooli.RoolitId };
                SqlParameter rooliId = new SqlParameter("@rooliId", System.Data.SqlDbType.Int)
                { Value = rooli.Rooli_Id };
                SqlParameter profiiliId = new SqlParameter("@profiiliId", System.Data.SqlDbType.Int)
                { Value = rooli.Profiili_Id };
                SqlParameter active = new SqlParameter("@Active", System.Data.SqlDbType.Bit)
                { Value = rooli.Active };

                string query = "EXEC [app].[UpdateRoolit] @roolitId, @rooliId, @profiiliId, @Active, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, rooliId, roolitId, profiiliId, active, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { rooli.RoolitId.ToString() };

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
        /// Delete Roolit
        /// </summary>
        /// <returns></returns>
        /// 
        [HttpDelete]
        [Route("api/Roolit/Roolit/Delete/{id}")]
        public IActionResult DeleteRoolit(int id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter roolitId = new SqlParameter("@roolitId", System.Data.SqlDbType.Int)
                { Value = id };

                string query = "EXEC [app].[DeleteRoolit] @roolitId, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, roolitId, roolit, usercontext);
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

        /*********** RooliOikeudet ******/

        /// <summary>
        /// Get RooliOikeudet
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/Roolit/RooliOikeudet/Read")]
        public IActionResult GetRooliOikeudet()
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };
                SqlParameter roolitId = new SqlParameter("@roolioikeudetId", System.Data.SqlDbType.Int)
                { Value = DBNull.Value };

                string query = "exec app.GetRooliOikeudet @roolioikeudetId, @roolit, @usercontext";
                var retval = db.RooliOikeudet.FromSqlRaw(query, roolitId, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.RooliOikeudetId.ToString()).ToList();

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
        /// Create RooliOikeudet
        /// </summary>
        /// <returns></returns>
        /// 
        [HttpPost]
        [Route("api/Roolit/RooliOikeudet/Create")]
        public IActionResult CreateRooliOikeudet([FromBody] RooliOikeudet rooli)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter rooliId = new SqlParameter("@rooliId", System.Data.SqlDbType.Int)
                { Value = rooli.Rooli_Id };
                SqlParameter entiteettiId = new SqlParameter("@entiteettiId", System.Data.SqlDbType.Int)
                { Value = rooli.Entiteetti_Id };
                SqlParameter kohdeId = new SqlParameter("@kohdeId", System.Data.SqlDbType.Int)
                { Value = (object)rooli.Rivi_Id ?? DBNull.Value };

                string query = "EXEC [app].[AddRooliOikeudet] @rooliId, @entiteettiId, @kohdeId, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, rooliId, entiteettiId, kohdeId, roolit, usercontext);
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
        /// Update RooliOikeudet
        /// </summary>
        /// <returns></returns>
        /// 
        [HttpPost]
        [Route("api/Roolit/RooliOikeudet/Update")]
        public IActionResult UpdateRooliOikeudet([FromBody] RooliOikeudet rooli)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter roolitId = new SqlParameter("@roolioikeudetId", System.Data.SqlDbType.Int)
                { Value = rooli.RooliOikeudetId };
                SqlParameter rooliId = new SqlParameter("@rooliId", System.Data.SqlDbType.Int)
                { Value = rooli.Rooli_Id };
                SqlParameter entiteettiId = new SqlParameter("@entiteettiId", System.Data.SqlDbType.Int)
                { Value = rooli.Entiteetti_Id };
                SqlParameter kohdeId = new SqlParameter("@kohdeId", System.Data.SqlDbType.Int)
                { Value = (object)rooli.Rivi_Id ?? DBNull.Value };
                SqlParameter active = new SqlParameter("@active", System.Data.SqlDbType.Bit)
                { Value = rooli.Active };

                string query = "EXEC [app].[UpdateRooliOikeudet] @roolioikeudetId, @rooliId, @entiteettiId, @active, @kohdeId, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, roolitId, rooliId, entiteettiId, active, kohdeId, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { rooli.RooliOikeudetId.ToString() };

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
        /// Delete RooliOikeudet
        /// </summary>
        /// <returns></returns>
        /// 
        [HttpDelete]
        [Route("api/Roolit/RooliOikeudet/Delete/{id}")]
        public IActionResult DeleteRooliOikeudet(int id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter roolitId = new SqlParameter("@roolioikeudetId", System.Data.SqlDbType.Int)
                { Value = id };

                string query = "EXEC [app].[DeleteRooliOikeudet] @roolioikeudetId, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, roolitId, roolit, usercontext);
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


        /*********** Entiteetit ******/

        /// <summary>
        /// Get Entiteetit
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/Roolit/Entiteetit/Read")]
        public IActionResult GetEntiteetit()
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter entiteettiId = new SqlParameter("@entiteettiId", System.Data.SqlDbType.Int)
                { Value = DBNull.Value };

                string query = "exec app.GetEntiteetit @entiteettiId, @roolit, @usercontext";
                var retval = db.Entiteetit.FromSqlRaw(query, entiteettiId, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.EntiteettiId.ToString()).ToList();

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
