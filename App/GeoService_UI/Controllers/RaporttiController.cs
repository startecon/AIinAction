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
using Microsoft.FeatureManagement;
using Microsoft.FeatureManagement.Mvc;
using Newtonsoft.Json;

namespace GeoService_UI.Controllers
{
    /// <summary>
    /// Raportti
    /// </summary>
    /// 

    [Authorize]
    public class RaporttiController : Controller
    {
        private readonly WebAppContext db;
        private readonly UserService userService;
        private readonly IAzureLogs logger;
        private readonly string env;
        private readonly string loadtestuser;

        public RaporttiController(IConfiguration configuration, IAzureLogs azureLogs, WebAppContext db, UserService userService)
        {
            this.env = (configuration.GetValue<string>("APP_ENV") ?? "unknown").ToLower();
            this.logger = azureLogs;
            this.db = db;
            this.userService = userService;
            //TODO: LOADTEST
            this.loadtestuser = (this.env == "datadev") ? "mikko.lahdeaho@startecon.fi" : "";
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
                ResourceType = "Raportti", //TODO: Vaihda controllerin mukaiseksi
                SubresourceId = ""
            };

            logger.Post(post);
        }

        /********* Raportti ************/

        /// <summary>
        /// Get Raportti
        /// </summary>
        /// <returns>Raportti</returns>
        /// 
        [HttpGet]
        [Route("api/Raportti/Read")]
        [Route("api/Raportti/Read/{id}")]
        public IActionResult GetRaportti(int? id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");

                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter riviavain = new SqlParameter("@riviavain", System.Data.SqlDbType.Int)
                { Value = (object)id ?? DBNull.Value };

                string query = "exec app.GetRaportti @riviavain, @roolit, @usercontext";
                var retval = db.Raportti.FromSqlRaw(query, riviavain, roolit, usercontext).ToList();
                var ids = retval.Select(x => x.RiviAvain.ToString()).ToList();
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
            catch
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }

        /// <summary>
        /// Create Raportti
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Raportti/Create")]
        public IActionResult CreateRaportti([FromBody] Raportti raportti)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");

                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter ryhmaavain = new SqlParameter("@ryhmaavain", System.Data.SqlDbType.Int)
                { Value = raportti.RyhmaAvain };
                SqlParameter tyyppiavain = new SqlParameter("@tyyppiavain", System.Data.SqlDbType.Int)
                { Value = raportti.TyyppiAvain };
                SqlParameter raporttiavain = new SqlParameter("@raporttiavain", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.RaporttiAvain ?? DBNull.Value };
                SqlParameter kieli = new SqlParameter("@kieli", System.Data.SqlDbType.Char, 2)
                { Value = (object)raportti.Kieli ?? DBNull.Value };
                SqlParameter raporttinimi = new SqlParameter("@raporttinimi", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.RaporttiNimi ?? DBNull.Value };
                SqlParameter raporttitiedostonimi = new SqlParameter("@raporttitiedostonimi", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.RaporttiTiedostoNimi ?? DBNull.Value };
                SqlParameter raporttikuvaus = new SqlParameter("@raporttikuvaus", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)raportti.RaporttiKuvaus ?? DBNull.Value };
                SqlParameter raporttitunnus = new SqlParameter("@raportti", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.RaporttiTunnus ?? DBNull.Value };
                SqlParameter parametrit = new SqlParameter("@parametrit", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)raportti.Parametrit ?? DBNull.Value };
                SqlParameter tietojoukko = new SqlParameter("@tietojoukko", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.Tietojoukko ?? DBNull.Value };
                SqlParameter sivu = new SqlParameter("@sivu", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.Sivu ?? DBNull.Value };
                SqlParameter suodattimet = new SqlParameter("@suodattimet", System.Data.SqlDbType.Int)
                { Value = (raportti.Suodattimet == true ? 1 : 0) };
                SqlParameter raporttisivut = new SqlParameter("@raporttisivut", System.Data.SqlDbType.Int)
                { Value = (raportti.Raporttisivut == true ? 1 : 0) };
                SqlParameter kirjanmerkit = new SqlParameter("@kirjanmerkit", System.Data.SqlDbType.Int)
                { Value = (raportti.Kirjanmerkit == true ? 1 : 0) };
                SqlParameter asettelu = new SqlParameter("@asettelu", System.Data.SqlDbType.VarChar, 50)
                { Value = (object)raportti.Asettelu ?? DBNull.Value };
                SqlParameter nosto = new SqlParameter("@nosto", System.Data.SqlDbType.VarChar, 50)
                { Value = (object)raportti.Nosto ?? DBNull.Value };
                SqlParameter lisatiedot = new SqlParameter("@lisatiedot", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)raportti.Lisatiedot ?? DBNull.Value };
                SqlParameter kuva = new SqlParameter("@kuva", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.Kuva ?? DBNull.Value };

                string query = "EXEC [app].[AddRaportti] " +
                    "@ryhmaavain, " +
                    "@tyyppiavain, " +
                    "@raporttiavain, " +
                    "@kieli, " +
                    "@raporttinimi, " +
                    "@raporttitiedostonimi, " +
                    "@raporttikuvaus, " +
                    "@raportti, " +
                    "@parametrit, " +
                    "@tietojoukko, " +
                    "@sivu, " +
                    "@suodattimet, " +
                    "@raporttisivut, " +
                    "@kirjanmerkit, " +
                    "@asettelu, " +
                    "@nosto, " +
                    "@lisatiedot, " +
                    "@roolit, " +
                    "@usercontext" +
                    "@kuva";

                db.Database.ExecuteSqlRaw(query, ryhmaavain, tyyppiavain, raporttiavain, kieli, raporttinimi, raporttitiedostonimi, 
                    raporttikuvaus, raporttitunnus, parametrit, tietojoukko, sivu, suodattimet, raporttisivut, kirjanmerkit, asettelu, nosto, lisatiedot, roolit, usercontext, kuva);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { "-1" };

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
            catch
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }

        /// <summary>
        /// Update Raportti
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpPost]
        [Route("api/Raportti/Update")]
        public IActionResult UpdateRaportti([FromBody] Raportti raportti)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");

                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter riviavain = new SqlParameter("@riviavain", System.Data.SqlDbType.Int)
                { Value = raportti.RiviAvain };
                SqlParameter ryhmaavain = new SqlParameter("@ryhmaavain", System.Data.SqlDbType.Int)
                { Value = raportti.RyhmaAvain };
                SqlParameter tyyppiavain = new SqlParameter("@tyyppiavain", System.Data.SqlDbType.Int)
                { Value = raportti.TyyppiAvain };
                SqlParameter raporttiavain = new SqlParameter("@raporttiavain", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.RaporttiAvain ?? DBNull.Value };
                SqlParameter kieli = new SqlParameter("@kieli", System.Data.SqlDbType.Char, 2)
                { Value = (object)raportti.Kieli ?? DBNull.Value };
                SqlParameter raporttinimi = new SqlParameter("@raporttinimi", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.RaporttiNimi ?? DBNull.Value };
                SqlParameter raporttitiedostonimi = new SqlParameter("@raporttitiedostonimi", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.RaporttiTiedostoNimi ?? DBNull.Value };
                SqlParameter raporttikuvaus = new SqlParameter("@raporttikuvaus", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)raportti.RaporttiKuvaus ?? DBNull.Value };
                SqlParameter raporttitunnus = new SqlParameter("@raportti", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.RaporttiTunnus ?? DBNull.Value };
                SqlParameter parametrit = new SqlParameter("@parametrit", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)raportti.Parametrit ?? DBNull.Value };
                SqlParameter tietojoukko = new SqlParameter("@tietojoukko", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.Tietojoukko ?? DBNull.Value };
                SqlParameter sivu = new SqlParameter("@sivu", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.Sivu ?? DBNull.Value };
                SqlParameter suodattimet = new SqlParameter("@suodattimet", System.Data.SqlDbType.Int)
                { Value = (raportti.Suodattimet == true ? 1 : 0) };
                SqlParameter raporttisivut = new SqlParameter("@raporttisivut", System.Data.SqlDbType.Int)
                { Value = (raportti.Raporttisivut == true ? 1 : 0) };
                SqlParameter kirjanmerkit = new SqlParameter("@kirjanmerkit", System.Data.SqlDbType.Int)
                { Value = (raportti.Kirjanmerkit == true ? 1 : 0) };
                SqlParameter asettelu = new SqlParameter("@asettelu", System.Data.SqlDbType.VarChar, 50)
                { Value = (object)raportti.Asettelu ?? DBNull.Value };
                SqlParameter nosto = new SqlParameter("@nosto", System.Data.SqlDbType.VarChar, 50)
                { Value = (object)raportti.Nosto ?? DBNull.Value };
                SqlParameter lisatiedot = new SqlParameter("@lisatiedot", System.Data.SqlDbType.VarChar, 8000)
                { Value = (object)raportti.Lisatiedot ?? DBNull.Value };
                SqlParameter kuva = new SqlParameter("@kuva", System.Data.SqlDbType.VarChar, 255)
                { Value = (object)raportti.Kuva ?? DBNull.Value };

                string query = "EXEC [app].[UpdateRaportti] " + 
                    "@riviavain, " +
                    "@ryhmaavain, " +
                    "@tyyppiavain, " +
                    "@raporttiavain, " +
                    "@kieli, " +
                    "@raporttinimi, " +
                    "@raporttitiedostonimi, " +
                    "@raporttikuvaus, " +
                    "@raportti, " +
                    "@parametrit, " +
                    "@tietojoukko, " +
                    "@sivu, " +
                    "@suodattimet, " +
                    "@raporttisivut, " +
                    "@kirjanmerkit, " +
                    "@asettelu, " +
                    "@nosto, " +
                    "@lisatiedot, " +
                    "@roolit, " +
                    "@usercontext" +
                    "@kuva";
                db.Database.ExecuteSqlRaw(query, riviavain, ryhmaavain, tyyppiavain, raporttiavain, kieli, raporttinimi, raporttitiedostonimi,
                    raporttikuvaus, raporttitunnus, parametrit, tietojoukko, sivu, suodattimet, raporttisivut, kirjanmerkit, asettelu, nosto, lisatiedot, roolit, usercontext, kuva);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { raportti.RiviAvain.ToString() };

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
            catch
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }


        /// <summary>
        /// Delete Raportti
        /// </summary>
        /// <returns>1</returns>
        /// 
        [HttpDelete]
        [Route("api/Raportti/Delete/{id}")]
        public IActionResult DeleteRaportti(int id)
        {
            try
            {
                // Roolit ja usercontext
                string username = HttpContext.User.FindFirstValue("preferred_username");

                SqlParameter roolit = new SqlParameter("@roolit", System.Data.SqlDbType.VarChar, 8000)
                { Value = "ei_rooleja" };
                SqlParameter usercontext = new SqlParameter("@usercontext", System.Data.SqlDbType.VarChar, 8000)
                { Value = username };

                SqlParameter riviavain = new SqlParameter("@riviavain", System.Data.SqlDbType.Int)
                { Value = id };

                string query = "EXEC [app].[DeleteRaportti] @riviavain, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, riviavain, roolit, usercontext);
                var retval = new { error = false, message = "OK" };
                var ids = new List<string>() { id.ToString() };

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
            catch
            {
                return BadRequest(new { error = 1, message = "ERROR" });
            }
        }
    }
}
