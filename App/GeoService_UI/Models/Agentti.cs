using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public partial class Agentti
    {
        [Key]
        public int RiviAvain { get; set; }
        public int ProjektiAvain { get; set; }
        public int TyyppiAvain { get; set; }
        public string AgenttiNimi { get; set; }
        public int OSAvain { get; set; }
        public int CPU { get; set; }
        public int CPUAvain { get; set; }
        public int Muisti { get; set; }
        public int Levykoko { get; set; }
        public int GPU { get; set; }
        public int GPUAvain { get; set; }
        public string Kuvaus { get; set; }
        public string RekisterointiAvain { get; set; }
        public DateTime? Syke { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
    }
}