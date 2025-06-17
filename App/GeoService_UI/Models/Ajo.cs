using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public partial class Ajo
    {
        [Key]
        public int RiviAvain { get; set; }
        public int TehtavaAvain { get; set; }
        public int Prioriteetti { get; set; }
        public string AjoNimi { get; set; }
        public DateTime? Aloitus { get; set; }
        public DateTime? Lopetus { get; set; }
        public bool? Ajastettu { get; set; }
        public int RiviTilaAvain { get; set; }
        public string Selite { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
    }
}