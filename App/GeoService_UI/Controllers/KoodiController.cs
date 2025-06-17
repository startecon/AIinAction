using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Claims;
using GeoService_UI.Models;
using GeoService_UI.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Data;
using GeoService_UI.Utils;
using static System.Int32;

namespace GeoService_UI.Controllers
{
    /// <summary>
    /// Koodi
    /// Koodiryhma
    /// </summary>
    /// 
    [Authorize]
    [Route("api")]
    public class KoodiController(
        CommonSql commonSql,
        WebAppContext db)
        : Controller
    {
        private void WriteLog(string query, List<string> identities)
        {
            commonSql.WriteLog(query, identities, "Koodi");
        }

        /********* Koodi ************/

        /// <summary>
        /// Get Koodi
        /// </summary>
        /// <returns>Koodi</returns>
        /// 
        //[FeatureGate(RequirementType.Any, KTIFeatureFlags.Api_Etusivu_Luku, KTIFeatureFlags.Api_Etusivu_Muokkaus, KTIFeatureFlags.Api_Koodi_Luku, KTIFeatureFlags.Api_Koodi_Muokkaus)]
        [HttpGet]
        [Route("Koodi/Read")]
        [Route("Koodi/Read/{id}")]
        public IActionResult GetKoodi(int? id)
        {
            try
            {
                var parameters = commonSql.GetCommonParameters();
                parameters.AddRange(new SqlParameter[] {
                    new("@koodiavain", SqlDbType.Int) { Value = (object)id ?? DBNull.Value }
                });
                var query = "EXEC [app].[GetKoodi] @koodiavain, @roolit, @usercontext";
                var retval = db.Koodi.FromSqlRaw(query, parameters.ToArray()).ToList();
                var ids = retval.Select(x => x.KoodiAvain.ToString()).ToList();
                WriteLog(query, ids);
                return Ok(retval);
            }
            catch (SqlException ex)
            {
                return commonSql.HandleSqlException(ex);
            }
            catch (Exception ex)
            {
                return commonSql.HandleCriticalException(ex);
            }
        }


        /// <summary>
        /// Create Koodi
        /// </summary>
        /// <returns>1</returns>
        /// 
        //[FeatureGate(KTIFeatureFlags.Api_Koodi_Muokkaus)]
        [HttpPost]
        [Route("Koodi/Create")]
        public IActionResult CreateKoodi([FromBody] Koodi koodi)
        {
            try
            {
                var parameters = commonSql.GetCommonParameters();
                parameters.AddRange(new SqlParameter[] {
                    new("@koodiryhmaavain", SqlDbType.Int){ Value = koodi.KoodiryhmaAvain },
                    new("@koodi", SqlDbType.VarChar, 50) { Value = koodi.KoodiNimi },
                    new("@koodien", SqlDbType.VarChar, 50) { Value = (object)koodi.KoodiNimiEN ?? koodi.KoodiNimi },
                    new("@koodikuvaus", SqlDbType.VarChar, 255) { Value = (object)koodi.KoodiKuvaus ?? DBNull.Value },
                    new("@koodikuvausen", SqlDbType.VarChar, 255) { Value = (object)koodi.KoodiKuvausEN ?? DBNull.Value }
                });
                var query = "EXEC [app].[AddKoodi] @koodiryhmaavain, @koodi, @koodien, @koodikuvaus, @koodikuvausen, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, parameters.ToArray());
                var ids = new List<string> { "-1" };

                WriteLog(query, ids);

                return commonSql.HandleOkResponse();
            }
            catch (SqlException ex)
            {
                return commonSql.HandleSqlException(ex);
            }
            catch (Exception ex)
            {
                return commonSql.HandleCriticalException(ex);
            }
        }


        /// <summary>
        /// Create Koodi
        /// 
        /// input: (string) koodi;koodiryhmaavain
        /// </summary>
        /// <returns>1</returns>
        /// 
        //[FeatureGate(KTIFeatureFlags.Api_Koodi_Muokkaus)]
        [HttpPost]
        [Route("Koodi/CreateAddHoc")]
        public IActionResult CreateKoodi([FromBody] string koodi)
        {
            try
            {
                TryParse(koodi.Split(';')[1], out var koodiryhma);

                var parameters = commonSql.GetCommonParameters();
                parameters.AddRange(new SqlParameter[] {
                        new("@koodiryhmaavain", SqlDbType.Int){ Value = koodiryhma },
                        new("@koodi", SqlDbType.VarChar, 50) { Value = koodi.Split(';')[0] },
                        new("@koodien", SqlDbType.VarChar, 50) { Value = koodi.Split(';')[0] },
                        new("@koodikuvaus", SqlDbType.VarChar, 255) { Value = DBNull.Value },
                        new("@koodikuvausen", SqlDbType.VarChar, 255) { Value = DBNull.Value }
                    });
                var query = "EXEC [app].[AddKoodi] @koodiryhmaavain, @koodi, @koodien, @koodikuvaus, @koodikuvausen, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, parameters.ToArray());
                var ids = new List<string> { "-1" };

                WriteLog(query, ids);

                return commonSql.HandleOkResponse();
            }
            catch (SqlException ex)
            {
                return commonSql.HandleSqlException(ex);
            }
            catch (Exception ex)
            {
                return commonSql.HandleCriticalException(ex);
            }
        }

        /// <summary>
        /// Update Koodi
        /// </summary>
        /// <returns>1</returns>
        /// 
        //[FeatureGate(KTIFeatureFlags.Api_Koodi_Muokkaus)]
        [HttpPost]
        [Route("Koodi/Update")]
        public IActionResult UpdateKoodi([FromBody] Koodi koodi)
        {
            try
            {
                var parameters = commonSql.GetCommonParameters();
                parameters.AddRange(new SqlParameter[] {
                    new("@koodiavain", SqlDbType.Int) { Value = koodi.KoodiAvain },
                    new("@koodiryhmaavain", SqlDbType.Int){ Value = koodi.KoodiryhmaAvain },
                    new("@koodi", SqlDbType.VarChar, 50) { Value = koodi.KoodiNimi },
                    new("@koodien", SqlDbType.VarChar, 50) { Value = (object)koodi.KoodiNimiEN ?? koodi.KoodiNimi },
                    new("@koodikuvaus", SqlDbType.VarChar, 255) { Value = (object)koodi.KoodiKuvaus ?? DBNull.Value },
                    new("@koodikuvausen", SqlDbType.VarChar, 255) { Value = (object)koodi.KoodiKuvausEN ?? DBNull.Value }
                });
                var query = "EXEC [app].[UpdateKoodi] @koodiavain, @koodiryhmaavain, @koodi, @koodien, @koodikuvaus, @koodikuvausen, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, parameters.ToArray());
                var ids = new List<string> { koodi.KoodiAvain.ToString() };

                WriteLog(query, ids);

                return commonSql.HandleOkResponse();
            }
            catch (SqlException ex)
            {
                return commonSql.HandleSqlException(ex);
            }
            catch (Exception ex)
            {
                return commonSql.HandleCriticalException(ex);
            }
        }

        /// <summary>
        /// Delete Koodi
        /// </summary>
        /// <returns>1</returns>
        /// 
        //[FeatureGate(KTIFeatureFlags.Api_Koodi_Muokkaus)]
        [HttpGet]
        [Route("Koodi/Delete/{id}")]
        public IActionResult DeleteKoodi(int id)
        {
            try
            {
                var parameters = commonSql.GetCommonParameters();
                parameters.AddRange(new SqlParameter[] {
                    new("@koodiavain", SqlDbType.Int) { Value = id },
                });
                var query = "EXEC [app].[DeleteKoodi] @koodiavain, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, parameters.ToArray());
                var ids = new List<string>() { id.ToString() };

                WriteLog(query, ids);

                return commonSql.HandleOkResponse();
            }
            catch (SqlException ex)
            {
                return commonSql.HandleSqlException(ex);
            }
            catch (Exception ex)
            {
                return commonSql.HandleCriticalException(ex);
            }
        }


        /********* Koodiryhma ************/

        /// <summary>
        /// Get Koodiryhma
        /// </summary>
        /// <returns>Koodiryhma</returns>
        /// 
        //[FeatureGate(RequirementType.Any, KTIFeatureFlags.Api_Etusivu_Luku, KTIFeatureFlags.Api_Etusivu_Muokkaus, KTIFeatureFlags.Api_Koodiryhma_Luku, KTIFeatureFlags.Api_Koodiryhma_Muokkaus)]
        [HttpGet]
        [Route("Koodiryhma/Read")]
        [Route("Koodiryhma/Read/{id}")]
        public IActionResult GetKoodiryhma(int? id)
        {
            try
            {
                var parameters = commonSql.GetCommonParameters();
                parameters.AddRange(new SqlParameter[] {
                    new("@koodiryhmavain", SqlDbType.Int) { Value = (object)id ?? DBNull.Value }
                });
                var query = "exec app.GetKoodiryhma @koodiryhmavain, @roolit, @usercontext";
                var retval = db.Koodiryhma.FromSqlRaw(query, parameters.ToArray()).ToList();
                var ids = retval.Select(x => x.KoodiryhmaAvain.ToString()).ToList();
                WriteLog(query, ids);
                return Ok(retval);
            }
            catch (SqlException ex)
            {
                return commonSql.HandleSqlException(ex);
            }
            catch (Exception ex)
            {
                return commonSql.HandleCriticalException(ex);
            }
        }

        /// <summary>
        /// Create Koodiryhma
        /// </summary>
        /// <returns>1</returns>
        /// 
        //[FeatureGate(KTIFeatureFlags.Api_Koodiryhma_Muokkaus)]
        [HttpPost]
        [Route("Koodiryhma/Create")]
        public IActionResult CreateKoodiryhma([FromBody] Koodiryhma koodiryhma)
        {
            try
            {
                var parameters = commonSql.GetCommonParameters();
                parameters.AddRange(new SqlParameter[] {
                    new("@koodiryhma", SqlDbType.VarChar,8000){ Value = koodiryhma.KoodiryhmaNimi },
                });
                var query = "EXEC [app].[AddKoodiryhma] @koodiryhma, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, parameters.ToArray());
                var ids = new List<string> { "-1" };

                WriteLog(query, ids);

                return commonSql.HandleOkResponse();
            }
            catch (SqlException ex)
            {
                return commonSql.HandleSqlException(ex);
            }
            catch (Exception ex)
            {
                return commonSql.HandleCriticalException(ex);
            }
        }

        /// <summary>
        /// Create Koodiryhma Add-hoc
        /// </summary>
        /// <returns>1</returns>
        /// 
        //[FeatureGate(KTIFeatureFlags.Api_Koodiryhma_Muokkaus)]
        [HttpPost]
        [Route("Koodiryhma/CreateAddHoc")]
        public IActionResult CreateKoodiryhma([FromBody] string koodiryhma)
        {
            try
            {
                var parameters = commonSql.GetCommonParameters();
                parameters.AddRange(new SqlParameter[] {
                    new("@koodiryhmaavain", SqlDbType.VarChar,8000){ Value = koodiryhma },
                });
                var query = "EXEC [app].[AddKoodiryhma] @koodiryhma, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, parameters.ToArray());
                var ids = new List<string> { "-1" };

                WriteLog(query, ids);

                return commonSql.HandleOkResponse();
            }
            catch (SqlException ex)
            {
                return commonSql.HandleSqlException(ex);
            }
            catch (Exception ex)
            {
                return commonSql.HandleCriticalException(ex);
            }
        }

        /// <summary>
        /// Update Koodiryhma
        /// </summary>
        /// <returns>1</returns>
        /// 
        //[FeatureGate(KTIFeatureFlags.Api_Koodiryhma_Muokkaus)]
        [HttpPost]
        [Route("Koodiryhma/Update")]
        public IActionResult UpdateKoodiryhma([FromBody] Koodiryhma koodiryhma)
        {
            try
            {
                var parameters = commonSql.GetCommonParameters();
                parameters.AddRange(new SqlParameter[] {
                    new("@koodiryhmaavain", SqlDbType.Int){ Value = koodiryhma.KoodiryhmaAvain },
                    new("@koodiryhma", SqlDbType.VarChar, 8000) { Value = koodiryhma.KoodiryhmaNimi }
                });
                var query = "EXEC [app].[UpdateKoodiryhma] @koodiryhmaavain, @koodiryhma, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, parameters.ToArray());
                var ids = new List<string> { koodiryhma.KoodiryhmaAvain.ToString() };

                WriteLog(query, ids);

                return commonSql.HandleOkResponse();
            }
            catch (SqlException ex)
            {
                return commonSql.HandleSqlException(ex);
            }
            catch (Exception ex)
            {
                return commonSql.HandleCriticalException(ex);
            }
        }


        /// <summary>
        /// Delete Koodiryhma
        /// </summary>
        /// <returns>1</returns>
        /// 
        //[FeatureGate(KTIFeatureFlags.Api_Koodiryhma_Muokkaus)]
        [HttpGet]
        [Route("Koodiryhma/Delete/{id}")]
        public IActionResult DeleteKoodiryhma(int id)
        {
            try
            {
                var parameters = commonSql.GetCommonParameters();
                parameters.AddRange(new SqlParameter[] {
                    new("@koodiryhmaavain", SqlDbType.Int) { Value = id },
                });
                var query = "EXEC [app].[DeleteKoodiryhma] @koodiryhmaavain, @roolit, @usercontext";
                db.Database.ExecuteSqlRaw(query, parameters.ToArray());
                var ids = new List<string>() { id.ToString() };

                WriteLog(query, ids);

                return commonSql.HandleOkResponse();
            }
            catch (SqlException ex)
            {
                return commonSql.HandleSqlException(ex);
            }
            catch (Exception ex)
            {
                return commonSql.HandleCriticalException(ex);
            }
        }
    }
}