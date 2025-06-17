using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public partial class Tehtava
    {
        [Key]
        public int RiviAvain { get; set; }
        public int ProjektiAvain { get; set; }
        public string TehtavaNimi { get; set; }
        public string Malli { get; set; }
        public int TilaAvain { get; set; }
        public int RiviTilaAvain { get; set; }
        public string Selite { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
    }
}
