using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public partial class Ajastus
    {
        [Key]
        public int RiviAvain { get; set; }
        public int TehtavaAvain { get; set; }
        public DateTime? Aloitus { get; set; }
        public DateTime? Lopetus { get; set; }
        public DateTime? Seuraava { get; set; }
        public DateTime? Edellinen { get; set; }
        public bool? Toistuva { get; set; }
        public int? Aikavali { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
    }
}