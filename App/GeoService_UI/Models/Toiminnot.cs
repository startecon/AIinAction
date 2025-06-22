using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public partial class Toiminnot
    {
        [Key]
        public int RiviAvain { get; set; }
        public string Paketti { get; set; }
        public string Toiminto { get; set; }
        public bool? Aktivoitu { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
    }
}