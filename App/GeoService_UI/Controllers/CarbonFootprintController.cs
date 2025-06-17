using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Claims;
using GeoService_UI.Models;
using GeoService_UI.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.FeatureManagement.Mvc;
using Newtonsoft.Json;

namespace GeoService_UI.Controllers
{
    [Authorize]
    public class CarbonFootprintController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;

        public CarbonFootprintController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
        {
            this.env = (configuration.GetValue<string>("APP_ENV") ?? "unknown").ToLower();
            this.logger = azureLogs;
            this.db = db;
            this.userService = userService;
        }


        [HttpGet]
        [Route("api/Carbon/Read")]
        public IActionResult GetCarbon()
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                string roles = string.Join(";", userService.GetRolesByUser());

                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = roles };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter riviavain = new SqlParameter("@RiviAvain", System.Data.SqlDbType.Int)
                { Value = DBNull.Value };

                string query = "exec app.GetCarbon @RiviAvain, @roolit, @usercontext";
                var retval = db.CarbonFootprint.FromSqlRaw(query, riviavain, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.RiviAvain.ToString()).ToList();

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
            catch
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }

        [HttpPost]
        [Route("api/Carbon/Create")]
        public IActionResult CreateCarbon([FromBody] CarbonFootprint carbon)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter source = new SqlParameter("@Source", System.Data.SqlDbType.VarChar, 255)
                { Value = carbon.Source };
                SqlParameter fuel = new SqlParameter("@FuelType", System.Data.SqlDbType.VarChar, 255)
                { Value = carbon.FuelType };
                SqlParameter amount = new SqlParameter("@Amount", System.Data.SqlDbType.VarChar, 255)
                { Value = carbon.Amount };
                SqlParameter unit = new SqlParameter("@Unit", System.Data.SqlDbType.VarChar, 255)
                { Value = carbon.Unit };
                SqlParameter emission = new SqlParameter("@EmissionFactor", System.Data.SqlDbType.VarChar, 255)
                { Value = carbon.EmissionFactor };
                SqlParameter date = new SqlParameter("@Date", System.Data.SqlDbType.VarChar, 255)
                { Value = carbon.Date };

                string query = "EXEC [app].[AddCarbon] @Source, @FuelType, @Amount, @Unit, @EmissionFactor, @Date, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, source, fuel, amount, unit, emission, date, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { "-1" };

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
            catch
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }

        [HttpPost]
        [Route("api/Carbon/Update")]
        public IActionResult UpdateCarbon([FromBody] CarbonFootprint carbon)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter avain = new SqlParameter("@RiviAvain", System.Data.SqlDbType.Int)
                { Value = carbon.RiviAvain };
                SqlParameter source = new SqlParameter("@Source", System.Data.SqlDbType.VarChar, 255)
                { Value = carbon.Source };
                SqlParameter fuel = new SqlParameter("@FuelType", System.Data.SqlDbType.VarChar, 255)
                { Value = carbon.FuelType };
                SqlParameter amount = new SqlParameter("@Amount", System.Data.SqlDbType.VarChar, 255)
                { Value = carbon.Amount };
                SqlParameter unit = new SqlParameter("@Unit", System.Data.SqlDbType.VarChar, 255)
                { Value = carbon.Unit };
                SqlParameter emission = new SqlParameter("@EmissionFactor", System.Data.SqlDbType.VarChar, 255)
                { Value = carbon.EmissionFactor };
                SqlParameter date = new SqlParameter("@Date", System.Data.SqlDbType.VarChar, 255)
                { Value = carbon.Date };

                string query = "EXEC [app].[UpdateCarbon] @RiviAvain, @Source, @FuelType, @Amount, @Unit, @EmissionFactor, @Date, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, avain, source, fuel, amount, unit, emission, date, roolit, usercontext);
                var retval = new { error = false, message = "OK" };

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
            catch
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }

        [HttpDelete]
        [Route("api/Carbon/Delete/{id}")]
        public IActionResult DeleteCarbon(int id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");
                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter riviavain = new SqlParameter("@RiviAvain", System.Data.SqlDbType.Int)
                { Value = id };

                string query = "EXEC [app].[DeleteCarbon] @RiviAvain, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, riviavain, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { id.ToString() };

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
            catch
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }
    }
}
