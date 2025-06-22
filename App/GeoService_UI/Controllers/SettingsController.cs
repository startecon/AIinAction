using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using GeoService_UI.Models;
using GeoService_UI.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

namespace GeoService_UI.Controllers
{
    [AllowAnonymous]
    public class SettingsController : Controller
    {
        private IConfiguration configuration;

        public SettingsController(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        [HttpGet]
        [Route("api/Settings")]
        public object GetSettings()
        {
            /** 
             *  Dynamic Configuration for MSAL from Key Vault (through appsettings and MSI)
             *  source: https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/481
            **/
            return new
            {
                authority = "https://login.microsoftonline.com/common/", //configuration.GetValue<string>("AzureAD:Instance") + configuration.GetValue<string>("AzureAD:TenantId"),
                clientId = configuration.GetValue<string>("AzureAD:ClientId"),
                redirectUri = configuration.GetValue<string>("AzureAD:CorsOrigin"),
                postLogoutRedirectUri = configuration.GetValue<string>("AzureAD:CorsOrigin")
            };
        }

        [HttpGet]
        [Route("api/Settings/FistList")]
        public object GetFist()
        {
            return new
            {
                url = configuration.GetValue<string>("FeatureStore:UI"),
                api = configuration.GetValue<string>("FeatureStore:API"),
                name = configuration.GetValue<string>("FeatureStore:Name")
            };
        }
    }
}
