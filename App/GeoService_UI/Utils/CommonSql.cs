using GeoService_UI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GeoService_UI.Utils
{
    public class CommonSql(
        IConfiguration configuration,
        IAzureLogs azureLogs,
        IHttpContextAccessor httpContextAccessor) : Controller
    {
        private const string NoRoles = "ei_rooleja";
        private const string PreferredUsername = "preferred_username";
        private const string PrincipalIdClaimType = "http://schemas.microsoft.com/identity/claims/objectidentifier";
        private const string GenericErrorText = "ERROR";
        private const string GenericOkText = "OK";
        private const string ApplicationName = "Karpon"; 

        private readonly string env = (configuration.GetValue<string>("APP_ENV") ?? "unknown").ToLower();

        public List<SqlParameter> GetCommonParameters()
        {
            var username = httpContextAccessor.HttpContext?.User.FindFirstValue(PreferredUsername);
            return
            [
                new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000) { Value = NoRoles },
                new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000) { Value = username }
            ];
        }

        public IActionResult HandleSqlException(SqlException ex)
        {
            if (ex.Class == 16) // Custom notifications
            {
                return BadRequest(new { error = ex.State, message = ex.Message }); //4 = user, 5 = plan
            }
            else
            {
                return BadRequest(new { error = 2, message = GenericErrorText });
            }
        }

        public IActionResult HandleCriticalException(Exception ex)
        {
            return BadRequest(new { error = 1, message = GenericErrorText });
        }

        public IActionResult HandleOkResponse()
        {
            return Ok(new { error = false, message = GenericOkText });
        }

        public void WriteLog(string query, List<string> identities, string resourceType)
        {
            var post = CreateLogEntry(query, identities, resourceType);
            azureLogs.Post(post);
        }
        private object CreateLogEntry(string query, List<string> identities, string resourceType)
        {
            return new
            {
                operation_Id = Guid.NewGuid().ToString(),
                operation_ParentId = "",
                operation_Time = DateTime.Now,
                Application = ApplicationName,
                Environment = env,
                PrincipalName = httpContextAccessor.HttpContext?.User.FindFirstValue(PreferredUsername),
                PrincipalId = httpContextAccessor.HttpContext?.User.FindFirstValue(PrincipalIdClaimType),
                Host = httpContextAccessor.HttpContext?.Request.Host.ToString(),
                Path = httpContextAccessor.HttpContext?.Request.Path.ToString(),
                QueryString = query,
                RemoteIpAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(),
                Identities = identities,
                ResourceType = resourceType,
                SubresourceId = ""
            };
        }
    }
}
