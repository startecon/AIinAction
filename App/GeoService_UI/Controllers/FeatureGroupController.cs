using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.FeatureManagement.Mvc;
using GeoService_UI.Models;

namespace GeoService_UI.Controllers
{
    /// <summary>
    /// FeatureGroup API
    /// </summary>
    /// 
    [FeatureGate(GeoServiceFeatureFlags.ApiFIST)]
    [Authorize]
    public class FeatureGroupController : Controller
    {
        private readonly HttpClient client = new HttpClient();
        private IConfiguration Configuration;
        private string fist_url;

        public FeatureGroupController(IConfiguration configuration)
        {
            this.Configuration = configuration;
            //TODO:DEV
            this.fist_url = Configuration.GetValue<string>("FeatureStore:API");
        }

        /********* FeatureGroup API ************/

        /// <summary>
        /// Get Feature Groups
        /// </summary>
        /// <returns>Feature Groups</returns>
        [HttpGet]
        [Route("api/FeatureGroup/Read")]
        [Route("api/FeatureGroup/Read/{projectid}")]
        [Route("api/FeatureGroup/Read/{projectid}/{id}")]
        public async Task<IActionResult> ReadFeatureGroup(Int64? projectid, Int64? id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                string tenantId = HttpContext.User.FindFirstValue("http://schemas.microsoft.com/identity/claims/tenantid");

                string url = string.Format("{0}/api/featuregroup/get/{1}/{2}", this.fist_url, tenantId, (projectid ?? -1));
                if (id != null)
                    url += string.Format("/{0}", id);

                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var stringTask = client.GetStringAsync(url);
                var json = await stringTask;

                return Ok(json);
            }
            catch (Exception ex) 
            {
                return BadRequest("ERROR: Cannot complete the request. " + ex.Message);
            }
        }
    }
}
