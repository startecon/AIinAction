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
using Microsoft.Graph.ExternalConnectors;

namespace GeoService_UI.Controllers
{
    /// <summary>
    /// Valhalla
    /// </summary>
    /// 

    [Authorize]
    public class GeocodingController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;
        private readonly string api_url;
        private readonly string api_key;

        public GeocodingController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
        {
            this.env = (configuration.GetValue<string>("APP_ENV") ?? "unknown").ToLower();
            this.logger = azureLogs;
            this.db = db;
            this.userService = userService;
            this.api_url = configuration.GetValue<string>("GeocodeServer:Url");
            this.api_key = configuration.GetValue<string>("GeocodeServer:ApiKey");
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
                ResourceType = "Geocoding", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        /********* Routing ************/

        /// <summary>
        /// Get Autocomplete
        /// https://digitransit.fi/en/developers/apis/2-geocoding-api/autocomplete/
        /// </summary>
        /// <returns>Object</returns>
        [HttpGet]
        [Route("api/Geocoding/Autocomplete/{text}")]
        [Route("api/Geocoding/Autocomplete/{text}/{lat}/{lng}")]
        public IActionResult GetAutocomplete(string text, string lat, string lng)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");

                string url = string.Format("{0}/autocomplete?text={1}&layers=address", this.api_url, text);

                if (lat != null)
                    url += string.Format("&focus.point.lat={0}", lat);

                if (lng != null)
                    url += string.Format("&focus.point.lon={0}", lng);

                // Request
                HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url);
                request.Headers.Add("digitransit-subscription-key", this.api_key);

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
        /// Get Location
        /// https://digitransit.fi/en/developers/apis/2-geocoding-api/address-search/
        /// </summary>
        /// <returns>Object</returns>
        [HttpGet]
        [Route("api/Geocoding/Location/{text}")]
        [Route("api/Geocoding/Location/{text}/{lat}/{lng}")]
        public IActionResult GetLocation(string text, string lat, string lng)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                string url = string.Format("{0}/search?text={1}&layers=address", this.api_url, text);

                if (lat != null)
                    url += string.Format("&focus.point.lat={0}", lat);

                if (lng != null)
                    url += string.Format("&focus.point.lon={0}", lng);

                // Request
                HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url);
                request.Headers.Add("digitransit-subscription-key", this.api_key);

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
        /// Get Address
        /// https://digitransit.fi/en/developers/apis/2-geocoding-api/address-search/
        /// </summary>
        /// <returns>Object</returns>
        [HttpGet]
        [Route("api/Geocoding/Address/{lat}/{lng}")]
        public IActionResult GetAddress(string lat, string lng)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                string url = string.Format("{0}/reverse?point.lat={1}&point.lon={2}&layers=address", this.api_url, lat, lng);

                // Request
                HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url);
                request.Headers.Add("digitransit-subscription-key", this.api_key);

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
