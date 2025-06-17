using System.Collections.Generic;
using Microsoft.Graph;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Microsoft.Identity.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using System;
using Microsoft.Identity.Client;

namespace GeoService_UI.Utils
{
    public interface IUserService
    {
        public string GetCurrentUserName();
        public List<string> GetRolesByUser();
    }
    public class UserService : IUserService
    {
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly string currentUser;
        private readonly List<string> currentRoles;
        private readonly IConfiguration configuration;
        private IConfidentialClientApplication app;

        public UserService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            this.configuration = configuration;
            this.httpContextAccessor = httpContextAccessor;
            this.currentUser = httpContextAccessor.HttpContext.User.FindFirstValue("preferred_username");
            try
            {
                this.currentRoles = GetRooliPerProfiiliAsync().Result;
            }
            catch (Exception ex)
            {
                this.currentRoles = new List<string>();
            }
        }

        public string GetCurrentUserName()
        {
            return currentUser;
        }

        public List<string> GetRolesByUser()
        {
            return currentRoles;
        }

        [AuthorizeForScopes(Scopes = new[] { "Group.Read.All", "user.read" })]
        private async Task<List<string>> GetRooliPerProfiiliAsync()
        {
            var userToken = await httpContextAccessor.HttpContext.GetTokenAsync("access_token");
            var appId = configuration.GetValue<string>("AzureAd:ClientId");
            var appKey = configuration.GetValue<string>("AzureAd:ClientSecret");
            var resource = "https://graph.microsoft.com";
            var tenantId = httpContextAccessor.HttpContext.User.FindFirstValue("http://schemas.microsoft.com/identity/claims/tenantid");
            var upn = httpContextAccessor.HttpContext.User.FindFirstValue("preferred_username");
            var token = GetAccessTokenOnBehalfOfAsync(userToken, appId, appKey, resource, tenantId, upn).Result;

            var graphServiceClient = new GraphServiceClient(
                new DelegateAuthenticationProvider((requestMessage) =>
                {
                    requestMessage
                    .Headers
                    .Authorization = new AuthenticationHeaderValue("bearer", token);

                    return Task.CompletedTask;
                }));
            var allGroups = await GetCurrentUserGroupsAsync(graphServiceClient).ConfigureAwait(false);
            return allGroups;
        }

        private async Task<List<string>> GetCurrentUserGroupsAsync(GraphServiceClient graphClient)
        {
            var totalGroups = new List<string>();
            //TODO: Seuraava vaatii "Directory.Read.All"
            //var memberOf = await graphClient.Users[currentUser].TransitiveMemberOf.Request().GetAsync();
            var memberOf = await graphClient.Users[currentUser].MemberOf.Request().GetAsync();

            while (memberOf != null)
            {
                foreach (var directoryObject in memberOf.CurrentPage)
                {
                    if (!(directoryObject is Group group)) continue;
                    totalGroups.Add(group.DisplayName);
                }
                if (memberOf.NextPageRequest != null)
                {
                    memberOf = await memberOf.NextPageRequest.GetAsync();
                }
                else
                {
                    memberOf = null;
                }
            }

            return totalGroups;
        }

        public async Task<string> GetAccessTokenOnBehalfOfAsync(string jwtToken, string appId, string appKey, string resource, string tenantid, string upn)
        {
            if (app == null)
            {
                string authority = string.Format("https://login.microsoftonline.com/{0}", tenantid);
                app = ConfidentialClientApplicationBuilder.Create(appId)
                    .WithClientSecret(appKey)
                    .WithAuthority(authority)
                    .Build();
            }

            UserAssertion userAssertion = new UserAssertion(jwtToken, "urn:ietf:params:oauth:grant-type:jwt-bearer");
            var result = await app.AcquireTokenOnBehalfOf(new[] { "https://graph.microsoft.com/.default" }, userAssertion).ExecuteAsync().ConfigureAwait(false);

            return result?.AccessToken;
        }
    }
}

