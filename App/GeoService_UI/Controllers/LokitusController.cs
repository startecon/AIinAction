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
using System.Threading;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Collections.Concurrent;
using Microsoft.Extensions.Hosting;

namespace GeoService_UI.Controllers
{
    /// <summary>
    /// Lokitus
    /// </summary>
    /// 

    [Authorize]
    public class LokitusController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;
        private readonly BackgroundWorkerQueue backgroundWorkerQueue;

        public LokitusController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService, BackgroundWorkerQueue backgroundWorkerQueue)
        {
            this.env = (configuration.GetValue<string>("APP_ENV") ?? "unknown").ToLower();
            this.logger = azureLogs;
            this.db = db;
            this.userService = userService;
            this.backgroundWorkerQueue = backgroundWorkerQueue;
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
                ResourceType = "Lokitus", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        [HttpGet]
        [Route("api/Lokitus/Read")]
        [Route("api/Lokitus/Read/{id}")]
        public IActionResult GetLoki(int? id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter riviavain = new SqlParameter("@Id", System.Data.SqlDbType.Int)
                { Value = (object)id ?? DBNull.Value };

                string query = "exec app.ReadLoki @Id, @roolit, @usercontext";
                var retval = db.Lokitus.FromSqlRaw(query, riviavain, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.Id.ToString()).ToList();

                //WriteLog(query, ids);

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

        [HttpPost]
        [Route("api/Lokitus/Create")]
        public async Task<int> CreateLoki()
        {
            await Task.Delay(1000);
            backgroundWorkerQueue.QueueBackgroundWorkItem(async token =>
            {
                WriteLoki();
                await Task.Delay(30000);
            });

            return 1;
        }

        private void WriteLoki()
        {
            for (int i = 0; i < 3; i++)
            {
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                string query = "exec app.WriteLoki @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, roolit, usercontext);
            }
        }

        [HttpGet]
        [Route("api/Lokitus/Clear")]
        public IActionResult ClearLoki()
        {
            string username = HttpContext.User.FindFirstValue("preferred_username");
            SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
            { Value = "ei_rooleja" };
            SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
            { Value = username };

            string query = "exec app.ClearLoki @roolit, @usercontext";
            var retval = db.Lokitus.FromSqlRaw(query, roolit, usercontext).ToList();
            var ids = retval.Select(x => x.Id.ToString()).ToList();

            //WriteLog(query, ids);

            return Ok(retval);
        }
    }
}