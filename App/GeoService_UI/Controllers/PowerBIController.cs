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
using System.Net;
using System.IO;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Options;
using Microsoft.FeatureManagement;

namespace GeoService_UI.Controllers
{
    /// <summary>
    /// Power BI Embedded
    /// </summary>
    /// 

    [Authorize]
    public class PowerBIController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;
        private readonly string loadtestuser;
        private readonly IOptions<PowerBI> powerBIsettings;
        private readonly PowerBIService powerBIService;

        public PowerBIController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService, PowerBIService powerBIService, IOptions<PowerBI> powerBIsettings)
        {
            this.env = (configuration.GetValue<string>("APP_ENV") ?? "unknown").ToLower();
            this.logger = azureLogs;
            this.db = db;
            this.userService = userService;
            this.powerBIsettings = powerBIsettings;
            this.powerBIService = powerBIService;
            //TODO: LOADTEST
            this.loadtestuser = (this.env == "datadev") ? "mikko.lahdeaho@startecon.fi" : "";
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
                ResourceType = "PowerBI", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        /********* Power BI ************/
        /// <summary>
        /// Get Embed Params
        /// </summary>
        /// <returns>Object</returns>
        [HttpGet]
        [Route("api/PowerBI/ReportParams/{id}")]
        public IActionResult GetReportParams(string id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");

                EmbedParams embedParams = this.powerBIService.GetEmbedParams(new Guid(this.powerBIsettings.Value.WorkspaceId), new Guid(id));

                string query = id;
                var retval = new { error = false, message = embedParams };
                var ids = new List<string>() { "-1" };

                WriteLog(query, ids);

                return Ok(retval);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }

        /// <summary>
        /// Get Embed Params with RLS
        /// </summary>
        /// <returns>Object</returns>
        /// 
        //[FeatureGate(RequirementType.Any, KTIFeatureFlags.Api_Etusivu_Luku, KTIFeatureFlags.Api_Etusivu_Muokkaus)]
        [HttpGet]
        [Route("api/PowerBI/ReportParamsRLS/{reportid}/{datasetid}")]
        [Route("api/PowerBI/ReportParamsRLS/{reportid}/{datasetid}/{pageId}")]
        public IActionResult GetReportParamsRLS(string reportId, string datasetId, string pageId)
        {
            try
            {
                // Roolit ja usercontext

                string username = GetRolesByUser(reportId, pageId);
                string role = "EndUser";

                EmbedParams embedParams = this.powerBIService.GetEmbedParams(username, role, new Guid(this.powerBIsettings.Value.WorkspaceId), new Guid(reportId), new Guid(datasetId));

                string query = reportId + "/" + datasetId;
                var retval = new { error = false, message = embedParams };
                var ids = new List<string>() { "-1" };

                WriteLog(query, ids);

                return Ok(retval);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = 1, message = ex.Message }); //TODO: Vaimenna tarkka ilmoitus, "ERROR"
            }
        }

        private string GetRolesByUser(string reportId, string pageId)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");

                //TODO: LOADTEST
                if (string.IsNullOrEmpty(username))
                {
                    username = this.loadtestuser;
                }

                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                // Toiminto tracking
                SqlParameter report = new SqlParameter("@reportId", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)reportId ?? DBNull.Value };
                SqlParameter page = new SqlParameter("@pageId", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)pageId ?? DBNull.Value };
                
                string query = "exec app.GetPowerBIRoles @reportId, @pageId, @usercontext";
                var retval = db.Rooli.FromSqlRaw(query, report, page, usercontext).ToList();
                var ids = retval.Select(x => x.RooliId.ToString()).ToList();

                WriteLog(query, ids);

                return string.Join(',', retval.Select(x => x.RooliNimi.ToString()).ToList());
            }
            catch (Exception ex)
            {
                throw;
            }

        }
    }
}
