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

namespace GeoService_UI.Controllers
{
    /// <summary>
    /// Valhalla
    /// </summary>
    /// 

    [Authorize]
    public class RoutingController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;
        private string api_url;

        public RoutingController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
        {
            this.env = (configuration.GetValue<string>("APP_ENV") ?? "unknown").ToLower();
            this.logger = azureLogs;
            this.db = db;
            this.userService = userService;
            this.api_url = configuration.GetValue<string>("Valhalla:Url");
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
                ResourceType = "Routing", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        /********* Routing ************/

        /// <summary>
        /// Get Route
        /// </summary>
        /// <returns>Object</returns>
        [HttpPost]
        [Route("api/Routing/Route/Read")]
        public IActionResult GetRoute([FromBody] JObject data)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                string json = JsonConvert.SerializeObject(data);

                string url = string.Format("{0}/route?json={1}", this.api_url, json); 

                // Request
                HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url);

                request.Method = "GET";
                string result = null;

                // Response
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                using (var streamReader = new StreamReader(response.GetResponseStream()))
                {
                    result = streamReader.ReadToEnd();
                }

                string query = url;
                var retval = new { error = false, message = result };
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
        /// Get Isochrone
        /// </summary>
        /// <returns>Object</returns>
        [HttpPost]
        [Route("api/Routing/Isochrone/Read")]
        public IActionResult GetIsochrone([FromBody] JObject data)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                string json = JsonConvert.SerializeObject(data);

                string url = string.Format("{0}/isochrone?json={1}", this.api_url, json);

                // Request
                HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url);

                request.Method = "GET";
                string result = null;

                // Response
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                using (var streamReader = new StreamReader(response.GetResponseStream()))
                {
                    result = streamReader.ReadToEnd();
                }

                string query = url;
                var retval = new { error = false, message = result };
                var ids = new List<string>() { "-1" };

                WriteLog(query, ids);

                return Ok(retval);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }

    }
}
