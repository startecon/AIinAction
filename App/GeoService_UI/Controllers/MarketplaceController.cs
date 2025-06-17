using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using GeoService_UI.Utils;
using GeoService_UI.Models;
using Microsoft.Marketplace.SaaS.Models;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.Marketplace.SaaS;
using System.Linq;
//using Operation = Microsoft.Marketplace.SaaS.Models.Operation;
using System.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.FeatureManagement.Mvc;

namespace GeoService_UI.Controllers
{
    [FeatureGate(GeoServiceFeatureFlags.ApiPalvelupaketti)]
    [Authorize]
    public class MarketplaceController : Controller
    {
        private readonly IMarketplaceSaaSClient saasApi;
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly IConfiguration configuration;
        private readonly IAzureLogs logger;
        private readonly string env;
        private readonly WebAppContext db;

        public MarketplaceController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IAzureLogs azureLogs, IMarketplaceSaaSClient saasApi, WebAppContext db)
        {
            this.env = (configuration.GetValue<string>("APP_ENV") ?? "unknown").ToLower();
            this.logger = azureLogs;
            this.configuration = configuration;
            this.httpContextAccessor = httpContextAccessor;
            this.saasApi = saasApi;
            this.db = db;
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
                ResourceType = "Marketplace", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        /* Subscription API */

        /* ResolvedSubscription
        public Guid? Id { get; }
        public string SubscriptionName { get; }
        public string OfferId { get; }
        public string PlanId { get; }
        public long? Quantity { get; }
        public Subscription Subscription { get; }
        */
        [HttpPost]
        [Route("api/Marketplace/Subscription/Resolve")]
        public async Task<IActionResult> Resolve([FromBody] JObject data)
        {
            string token = data["token"].ToString();

            if (token != null)
            {
                //Debuggaus
                if (token == "terve vaan")
                {
                    return Ok(new { Id = Guid.NewGuid() });
                }

                token = Uri.UnescapeDataString(token);
                var purchase = (await saasApi.Fulfillment.ResolveAsync(token)).Value;
                string query = "token=" + token;
                var ids = new List<string>() { purchase.Id.ToString() };

                WriteLog(query, ids);


                //TODO
                //1 Planit
                //2 Uuden luonti
                //3 Päivitys
                //TODO: SQL

                return Ok(purchase);
            }
            else
            {
                return BadRequest("INVALID TOKEN");
            }
        }

        [HttpGet]
        [Route("api/Marketplace/Subscription/Activate/{subscriptionId}/{planId}")]
        public async Task<IActionResult> Activate(string subscriptionId, string planId)
        {
            var response = await saasApi.Fulfillment.ActivateSubscriptionAsync(new Guid(subscriptionId), new SubscriberPlan { PlanId = planId });

            string query = String.Format("{0}/{1}", subscriptionId, planId);
            var ids = new List<string>() { response.ClientRequestId.ToString() };

            //TODO: Update status in DB

            WriteLog(query, ids);

            return Ok(response);
        }

        [HttpGet]
        [Route("api/Marketplace/Subscription/Read")]
        [Route("api/Marketplace/Subscription/Read/{id}")]
        public async Task<IActionResult> GetSubscription(string id)
        {
            var subscriptions = new List<Subscription>();
            var subsInDb = new List<Tilaus>();

            try
            {
                SqlParameter _id = new SqlParameter("@id", System.Data.SqlDbType.Char, 36)
                { Value = (object)id ?? DBNull.Value };

                string query = "EXEC [marketplace].[GetSubscription] @id";
                subsInDb = db.Tilaus.FromSqlRaw(query, _id).ToList();
                var ids = subsInDb.Select(x => x.Id.ToString()).ToList();

                WriteLog(query, ids);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }

            if (String.IsNullOrEmpty(id))
            {
                try
                {
                    var subs = saasApi.Fulfillment.ListSubscriptionsAsync();

                    await foreach (var sub in subs)
                    {
                        subscriptions.Add(sub);
                    }

                    var ids = subscriptions.Select(x => x.Id.ToString()).ToList();
                    WriteLog(id, ids);

                    return Ok(new { Subscriptions = subscriptions, SubsInDb = subsInDb });
                }
                catch (Exception ex)
                {
                    return BadRequest("ERROR");
                }
            }
            else
            {
                try
                {
                    var sub = (await saasApi.Fulfillment.GetSubscriptionAsync(new Guid(id))).Value;
                    subscriptions.Add(sub);

                    var ids = subscriptions.Select(x => x.Id.ToString()).ToList();
                    WriteLog(id, ids);

                    return Ok(new { Subscriptions = subscriptions, SubsInDb = subsInDb });
                }
                catch (Exception ex)
                {
                    return Ok(new { Error = "ERROR:" + ex.Message });
                }
            }

        }

        [HttpPost]
        [Route("api/Marketplace/Subscription/Create")]
        public IActionResult CreateSubscription([FromBody] JObject data)
        {
            try
            {
                var tenantId = httpContextAccessor.HttpContext.User.FindFirstValue("http://schemas.microsoft.com/identity/claims/tenantid");

                SqlParameter id = new SqlParameter("@id", System.Data.SqlDbType.Char, 36)
                { Value = data["id"].Value<string>() };
                SqlParameter publisherid = new SqlParameter("@publisherid", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["publisherId"].Value<string>() ?? DBNull.Value };
                SqlParameter offerid = new SqlParameter("@offerid", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["offerId"].Value<string>() ?? DBNull.Value };
                SqlParameter name = new SqlParameter("@name", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["name"].Value<string>() ?? DBNull.Value };
                SqlParameter saassubscriptionstatus = new SqlParameter("@saassubscriptionstatus", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)data["saasSubscriptionStatus"].Value<string>() ?? DBNull.Value };
                SqlParameter beneficiary = new SqlParameter("@beneficiary", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["beneficiary"].ToString() ?? DBNull.Value };
                SqlParameter purchaser = new SqlParameter("@purchaser", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["purchaser"].ToString() ?? DBNull.Value };
                SqlParameter planid = new SqlParameter("@planid", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["planId"].Value<string>() ?? DBNull.Value };
                SqlParameter quantity = new SqlParameter("@quantity", System.Data.SqlDbType.Int)
                { Value = (object)data["quantity"].Value<int?>() ?? DBNull.Value };
                SqlParameter term = new SqlParameter("@term", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["term"].ToString() ?? DBNull.Value };
                SqlParameter autorenew = new SqlParameter("@autorenew", System.Data.SqlDbType.Bit)
                { Value = (object)data["autoRenew"].Value<bool?>() ?? DBNull.Value };
                SqlParameter istest = new SqlParameter("@istest", System.Data.SqlDbType.Bit)
                { Value = (object)data["isTest"].Value<bool?>() ?? DBNull.Value };
                SqlParameter isfreetrial = new SqlParameter("@isfreetrial", System.Data.SqlDbType.Bit)
                { Value = (object)data["isFreeTrial"].Value<bool?>() ?? DBNull.Value };
                SqlParameter allowedcustomeroperations = new SqlParameter("@allowedcustomeroperations", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["allowedCustomerOperations"].ToString() ?? DBNull.Value };
                SqlParameter sessionid = new SqlParameter("@sessionid", System.Data.SqlDbType.Char, 36)
                { Value = (object)data["sessionId"].Value<string>() ?? DBNull.Value };
                SqlParameter fulfillmentid = new SqlParameter("@fulfillmentid", System.Data.SqlDbType.Char, 36)
                { Value = (object)data["fulfillmentId"].Value<string>() ?? DBNull.Value };
                SqlParameter storefront = new SqlParameter("@storefront", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["storeFront"].Value<string>() ?? DBNull.Value };
                SqlParameter sandboxtype = new SqlParameter("@sandboxtype", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)data["sandboxType"].Value<string>() ?? DBNull.Value };
                SqlParameter created = new SqlParameter("@created", System.Data.SqlDbType.DateTimeOffset, 7)
                { Value = (object)data["created"].Value<DateTime?>() ?? DBNull.Value };
                SqlParameter sessionmode = new SqlParameter("@sessionmode", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)data["sessionMode"].Value<string>() ?? DBNull.Value };
                SqlParameter fullName = new SqlParameter("@fullName", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["fullName"].Value<string>() ?? DBNull.Value };
                SqlParameter email = new SqlParameter("@email", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["email"].Value<string>() ?? DBNull.Value };
                SqlParameter companyId = new SqlParameter("@companyId", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["companyId"].Value<string>() ?? DBNull.Value };
                SqlParameter company = new SqlParameter("@company", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)data["company"].Value<string>() ?? DBNull.Value };
                SqlParameter tenantid = new SqlParameter("@tenantid", System.Data.SqlDbType.Char, 36)
                { Value = (object)data["tenantId"].Value<string>() ?? tenantId };

                string query = "EXEC [marketplace].[AddSubscription] @id, @publisherid, @offerid, @name, @saassubscriptionstatus, @beneficiary, @purchaser, @planid, " +
                    "@quantity, @term, @autorenew, @istest, @isfreetrial, @allowedcustomeroperations, @sessionid, @fulfillmentid, @storefront, @sandboxtype, @created, @sessionmode, " +
                    "@fullName, @email, @companyId, @company, @tenantid";
                db.Database.ExecuteSqlRaw(query, id, publisherid, offerid, name, saassubscriptionstatus, beneficiary, purchaser, planid, quantity, term, autorenew, istest, isfreetrial,
                    allowedcustomeroperations, sessionid, fulfillmentid, storefront, sandboxtype, created, sessionmode, fullName, email, companyId, company, tenantid);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { data["id"].ToString() };


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
            catch (Exception ex)
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }

    }
}

