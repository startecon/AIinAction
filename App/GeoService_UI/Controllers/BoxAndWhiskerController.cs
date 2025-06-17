using System.Linq;
using Microsoft.AspNetCore.Mvc;
using GeoService_UI.Models;
using Microsoft.EntityFrameworkCore;
using System.Data.SqlClient;
using System;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GeoService_UI.Utils;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using Microsoft.FeatureManagement.Mvc;
using System.Data;

namespace GeoService_UI.Controllers
{
    [FeatureGate(GeoServiceFeatureFlags.ApiBoxAndWhisker)]
    [Authorize]
    public class BoxAndWhiskerController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public BoxAndWhiskerController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
        {
            this.env = (configuration.GetValue<string>("APP_ENV") ?? "unknown").ToLower();
            this.logger = azureLogs;
            this.db = db;
            this.userService = userService;
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
                ResourceType = "BoxAndWhisker", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        //[HttpGet]
        //[Route("api/BoxAndWhisker/Read")]
        //[Route("api/BoxAndWhisker/Read/{id}")]
        //public IActionResult GetBoxAndWhisker(int? id)
        //{
        //    try
        //    {
        //        // Roolit ja usercontext
        //        string username = HttpContext.User.FindFirstValue("preferred_username");
        //        string roles = string.Join(";", userService.GetRolesByUser());

        //        SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
        //        { Value = roles };
        //        SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
        //        { Value = username };

        //        SqlParameter _id = new SqlParameter("@id", System.Data.SqlDbType.Int)
        //        { Value = (object)id ?? DBNull.Value };

        //        string query = "EXEC [powerbi].[GetBoxAndWhisker] @id, @roolit, @usercontext";
        //        var retval = db.BoxAndWhisker.FromSqlRaw(query, _id, roolit, usercontext).AsNoTracking().ToList();
        //        var ids = new List<string>() { "-1" };

        //        var obj = new BoxAndWhiskerMeasure()
        //        {
        //            Label = retval.FirstOrDefault().MeasureLabel,
        //            Description = retval.FirstOrDefault().MeasureDescription,
        //            Categories = new List<BoxAndWhiskerCategory>()
        //        };

        //        BoxAndWhisker prev = null;

        //        foreach (var item in retval)
        //        {
        //            if (prev == null || (prev != null && item.Category != prev.Category)) // eka kierros tai kategoria vaihtuu
        //            {
        //                obj.Categories.Add(new BoxAndWhiskerCategory()
        //                {
        //                    Label = item.Category,
        //                    Description = item.CategoryDescription,
        //                    Histogram = new List<HistogramBin>(),
        //                    Valuebins = new List<BoxAndWhiskerValues>()
        //                });
        //            }

        //            var current = obj.Categories.Count - 1;

        //            if (prev == null || (prev != null && item.LowerBound != prev.LowerBound) || (prev != null && item.Category != prev.Category)) // eka kierros tai hist bin vaihtuu
        //            {
        //                obj.Categories[current].Histogram.Add(new HistogramBin()
        //                {
        //                    Lowerbound = item.LowerBound,
        //                    Upperbound = item.UpperBound,
        //                    Count = item.Count
        //                });
        //                obj.Categories[current].Valuebins.Add(new BoxAndWhiskerValues()
        //                {
        //                    Values = new List<float>()
        //                });
        //            }

        //            obj.Categories[current].Valuebins[obj.Categories[current].Valuebins.Count - 1].Values.Add(item.Value);
        //            prev = item;
        //        }


        //        int maxBytes = BoxAndWhiskerMeasure.Serializer.GetMaxSize(obj);
        //        byte[] buffer = new byte[maxBytes];
        //        int bytesWritten = BoxAndWhiskerMeasure.Serializer.Write(buffer, obj);

        //        WriteLog(query, ids);

        //        return new FileContentResult(buffer, "application/octet-stream");
        //    }
        //    catch (SqlException ex)
        //    {
        //        if (ex.Class == 16) //Omat ilmoitukset
        //        {
        //            return BadRequest(new { error = ex.State, message = ex.Message }); //4 = user, 5 = plan
        //        }
        //        else
        //        {
        //            return BadRequest(new { error = 2, message = "ERROR" });
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(new { error = 1, message = "ERROR" });
        //    }
        //}

        ///** ADO.Net speed test **/
        //[HttpGet]
        //[Route("api/BoxAndWhisker/ReadAdo")]
        //[Route("api/BoxAndWhisker/ReadAdo/{id}")]
        //public IActionResult GetBoxAndWhiskerADONet(int? id)
        //{
        //    try
        //    {
        //        // Roolit ja usercontext
        //        string username = HttpContext.User.FindFirstValue("preferred_username");
        //        string roles = string.Join(";", userService.GetRolesByUser());

        //        SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
        //        { Value = roles };
        //        SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
        //        { Value = username };

        //        SqlParameter _id = new SqlParameter("@id", System.Data.SqlDbType.Int)
        //        { Value = (object)id ?? DBNull.Value };


        //        string connectionString = db.Configuration.GetConnectionString("DBString");

        //        List<BoxAndWhisker> retval = new List<BoxAndWhisker>();
        //        string query = "[powerbi].[GetBoxAndWhisker]";

        //        var obj = new BoxAndWhiskerMeasure()
        //        {
        //            Categories = new List<BoxAndWhiskerCategory>()
        //        };

        //        using (SqlConnection con = new SqlConnection(connectionString))
        //        {
        //            SqlCommand cmd = new SqlCommand(query, con);
        //            cmd.CommandType = CommandType.StoredProcedure;
        //            cmd.Parameters.Add(_id);
        //            cmd.Parameters.Add(roolit);
        //            cmd.Parameters.Add(usercontext);

        //            con.Open();
        //            SqlDataReader rdr = cmd.ExecuteReader();

        //            rdr.Read();
        //            obj.Label = rdr.GetString(1);
        //            obj.Description = rdr.GetString(2);

        //            string prev_category = null;
        //            float? prev_lowerbound = null;

        //            while (rdr.Read())
        //            {
        //                //var id = rdr.GetInt32(0);
        //                //var ids = retval.Select(x => x.Id.ToString()).ToList();
        //                //var measureLabel = rdr.GetString(1);
        //                //var measureDescription = rdr.GetString(2);
        //                var category = rdr.GetString(3);
                        
        //                var value = rdr.GetFloat(5);
        //                var lowerBound = rdr.GetFloat(6);

        //                if (String.IsNullOrEmpty(prev_category) || (!String.IsNullOrEmpty(prev_category) && category != prev_category)) // eka kierros tai kategoria vaihtuu
        //                {
        //                    var categoryDescription = rdr.GetString(4);

        //                    obj.Categories.Add(new BoxAndWhiskerCategory()
        //                    {
        //                        Label = category,
        //                        Description = categoryDescription,
        //                        Histogram = new List<HistogramBin>(),
        //                        Valuebins = new List<BoxAndWhiskerValues>()
        //                    });
        //                }

        //                var current = obj.Categories.Count - 1;

        //                if (prev_lowerbound == null || (prev_lowerbound != null && lowerBound != prev_lowerbound)) // eka kierros tai hist bin vaihtuu
        //                {
        //                    var upperBound = rdr.GetFloat(7);
        //                    var count = rdr.GetInt32(8);

        //                    obj.Categories[current].Histogram.Add(new HistogramBin()
        //                    {
        //                        Lowerbound = lowerBound,
        //                        Upperbound = upperBound,
        //                        Count = count
        //                    });

        //                    obj.Categories[current].Valuebins.Add(new BoxAndWhiskerValues()
        //                    {
        //                        Values = new List<float>()
        //                    });
        //                }

        //                obj.Categories[current].Valuebins[obj.Categories[current].Valuebins.Count - 1].Values.Add(value);
        //                prev_category = category;
        //                prev_lowerbound = lowerBound;

        //            }
        //            con.Close();
        //        }

        //        int maxBytes = BoxAndWhiskerMeasure.Serializer.GetMaxSize(obj);
        //        byte[] buffer = new byte[maxBytes];
        //        int bytesWritten = BoxAndWhiskerMeasure.Serializer.Write(buffer, obj);

        //        //WriteLog(query, ids);

        //        return new FileContentResult(buffer, "application/octet-stream");
        //    }
        //    catch (SqlException ex)
        //    {
        //        if (ex.Class == 16) //Omat ilmoitukset
        //        {
        //            return BadRequest(new { error = ex.State, message = ex.Message }); //4 = user, 5 = plan
        //        }
        //        else
        //        {
        //            return BadRequest(new { error = 2, message = "ERROR" });
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(new { error = 1, message = "ERROR" });
        //    }
        //}
    }
}