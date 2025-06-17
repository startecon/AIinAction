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
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.FeatureManagement.Mvc;

namespace GeoService_UI.Controllers
{
    [FeatureGate(GeoServiceFeatureFlags.ApiOhje)]
    [Authorize]
    public class MarkdownController : Controller
    {
        private readonly IWebHostEnvironment host;
        private readonly string env;
        private IConfiguration configuration;
        private readonly IAzureLogs logger;
        private readonly UserService userService;

        public MarkdownController(IConfiguration configuration, IAzureLogs azureLogs, UserService userService, IWebHostEnvironment host)
        {
            this.env = (configuration.GetValue<string>("APP_ENV") ?? "unknown").ToLower();
            this.host = host;
            this.configuration = configuration;
            this.userService = userService;
            this.logger = azureLogs;
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
                ResourceType = "Markddown", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        [HttpGet]
        [Route("api/Markdown/Index")]
        public async Task<IActionResult> GetStructure()
        {
            try
            {
                // Roolit ja usercontext
                string tenantId = HttpContext.User.FindFirstValue("http://schemas.microsoft.com/identity/claims/tenantid");
                string username = HttpContext.User.FindFirstValue("preferred_username");

                string contentPath = host.ContentRootPath;
                string docPath = Path.Combine(contentPath, "Docs", "online.json");

                string docText = await System.IO.File.ReadAllTextAsync(docPath);

                WriteLog("Index", new List<string>() { docText });

                return Ok(docText);
            }
            catch (Exception ex)
            {
                return BadRequest("ERROR: Cannot complete the request. " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/Markdown/Read")]
        public async Task<IActionResult> GetMarkdownDocument([FromBody] MarkdownRequest req)
        {
            try
            {
                // Roolit ja usercontext
                string tenantId = HttpContext.User.FindFirstValue("http://schemas.microsoft.com/identity/claims/tenantid");
                string username = HttpContext.User.FindFirstValue("preferred_username");

                string contentPath = Path.Combine(host.ContentRootPath, "Docs", "Online");
                string docPath = Path.Combine(contentPath, (req.Path.Substring(0, 1) == "/" ? req.Path.Substring(1) : req.Path)); //Remove leading / char

                string docText = await System.IO.File.ReadAllTextAsync(docPath);

                WriteLog("Text", new List<string>() { docText });

                return Ok(docText);
            }
            catch (Exception ex)
            {
                return BadRequest("ERROR: Cannot complete the request. " + ex.Message);
            }
        }
    }
}
