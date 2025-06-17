using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public partial class PalvelupakettiSisalto
    {
        [Key]
        public int PalvelupakettiSisaltoId { get; set; }
        public int Palvelupaketti_Id { get; set; }
        public int Toiminnot_Id { get; set; }
        public int Entiteetti_Id { get; set; }
        public int? Maksimi { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
    }
}