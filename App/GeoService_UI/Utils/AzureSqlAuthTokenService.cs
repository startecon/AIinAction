using System.Threading.Tasks;
using Azure.Core;
using Azure.Identity;

namespace GeoService_UI.Utils
{
    public interface IDBAuthTokenService
    {
        Task<string> GetToken();
    }

    public class AzureSqlAuthTokenService : IDBAuthTokenService
    {
        public async Task<string> GetToken()
        {
            var tokenCredential = new DefaultAzureCredential();
            var accessToken = await tokenCredential.GetTokenAsync(
                new TokenRequestContext(scopes: new string[] { "https://database.windows.net/.default" }) { }
            );

            return accessToken.Token;
        }
    }

}
