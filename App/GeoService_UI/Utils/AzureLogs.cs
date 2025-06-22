using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace GeoService_UI.Utils
{
    public interface IAzureLogs
    {
        void Post(object body);
    }

    public class AzureLogs : IAzureLogs
    {
        private string env;
        private string workspaceId;
        private string sharedKey;
        private string apiVersion;
        private string logType;

        public AzureLogs(IConfiguration configuration)
        {
            this.env = (configuration.GetValue<string>("APP_ENV") ?? "unknown").ToLower();
            this.workspaceId = configuration.GetValue<string>("UsageLogging:LawsWorkspaceId");
            this.sharedKey = configuration.GetValue<string>("UsageLogging:LawsSharedKey");
            this.logType = configuration.GetValue<string>("UsageLogging:LawsAppLogName");
            this.apiVersion = "2016-04-01";
        }

        public void Post(object body)
        {
            var json = JsonConvert.SerializeObject(body);
            PostLogAnalytics(json);
        }

        private void PostLogAnalytics(string json)
        {
            string requestUriString = $"https://{workspaceId}.ods.opinsights.azure.com/api/logs?api-version={apiVersion}";
            DateTime dateTime = DateTime.UtcNow;
            string dateString = dateTime.ToString("r");
            string signature = GetSignature("POST", json.Length, "application/json", dateString, "/api/logs");
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(requestUriString);
            request.ContentType = "application/json";
            request.Method = "POST";
            request.Headers["Log-Type"] = logType;
            request.Headers["x-ms-date"] = dateString;
            request.Headers["Authorization"] = signature;
            byte[] content = Encoding.UTF8.GetBytes(json);
            using (Stream requestStreamAsync = request.GetRequestStream())
            {
                requestStreamAsync.Write(content, 0, content.Length);
            }
            using (HttpWebResponse responseAsync = (HttpWebResponse)request.GetResponse())
            {
                if (responseAsync.StatusCode != HttpStatusCode.OK && responseAsync.StatusCode != HttpStatusCode.Accepted)
                {
                    Stream responseStream = responseAsync.GetResponseStream();
                    if (responseStream != null)
                    {
                        using (StreamReader streamReader = new StreamReader(responseStream))
                        {
                            throw new Exception(streamReader.ReadToEnd());
                        }
                    }
                }
            }
        }

        private string GetSignature(string method, int contentLength, string contentType, string date, string resource)
        {
            string message = $"{method}\n{contentLength}\n{contentType}\nx-ms-date:{date}\n{resource}";
            byte[] bytes = Encoding.UTF8.GetBytes(message);
            using (HMACSHA256 encryptor = new HMACSHA256(Convert.FromBase64String(sharedKey)))
            {
                return $"SharedKey {workspaceId}:{Convert.ToBase64String(encryptor.ComputeHash(bytes))}";
            }
        }

    }
}
