using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace GeoService_UI.Utils
{
    /// <summary>
    /// v12
    /// </summary>
    /// 
    public class AzureBlobs
    {
        public string accountName { get; set; }
        private string connString { get; set; }

        public AzureBlobs(string accountName, string connString)
        {
            this.accountName = accountName;
            this.connString = connString;  
        }

        public async Task CreateBlobFromText(string container, string blobName, string blobContents)
        {
            try
            {
                //TODO:DEV
                /*
                string containerEndpoint = string.Format("https://{0}.blob.core.windows.net/{1}", accountName, container);
                BlobContainerClient containerClient = new BlobContainerClient(new Uri(containerEndpoint), new DefaultAzureCredential());
                */
                BlobContainerClient containerClient = new BlobContainerClient(connString, container);
                containerClient.CreateIfNotExistsAsync().Wait();
                
                byte[] byteArray = Encoding.ASCII.GetBytes(blobContents);

                using (MemoryStream stream = new MemoryStream(byteArray))
                {
                    await containerClient.UploadBlobAsync(blobName, stream);
                }
            }
            catch
            {
                throw;
            }
        }

        public async Task CreateBlobFromFile(string container, string blobName, string filePath)
        {
            try
            {
                //TODO:DEV
                /*
                string containerEndpoint = string.Format("https://{0}.blob.core.windows.net/{1}", accountName, container);
                BlobContainerClient containerClient = new BlobContainerClient(new Uri(containerEndpoint), new DefaultAzureCredential());
                */
                BlobContainerClient containerClient = new BlobContainerClient(connString, container);
                containerClient.CreateIfNotExistsAsync().Wait();
                
                using (FileStream stream = File.OpenRead(filePath))
                {
                    await containerClient.UploadBlobAsync(blobName, stream);
                }
            }
            catch
            {
                throw;
            }
        }

        public async Task GetBlob(string container, string blobName, string filePath)
        {
            try
            {
                //TODO:DEV
                /*
                string containerEndpoint = string.Format("https://{0}.blob.core.windows.net/{1}", accountName, container);
                BlobContainerClient containerClient = new BlobContainerClient(new Uri(containerEndpoint), new DefaultAzureCredential());
                */
                BlobContainerClient containerClient = new BlobContainerClient(connString, container);
                
                BlobClient blobClient = containerClient.GetBlobClient(blobName);
                BlobDownloadInfo download = await blobClient.DownloadAsync();

                using (FileStream stream = File.OpenWrite(filePath))
                {
                    await download.Content.CopyToAsync(stream);
                }
            }
            catch
            {
                throw;
            }
        }
    }
}
