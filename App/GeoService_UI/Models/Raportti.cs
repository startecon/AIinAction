using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public class Raportti
    {
        [Key]
        public int RiviAvain { get; set; }
		public int RyhmaAvain { get; set; }
		public int TyyppiAvain { get; set; }
		public string RaporttiAvain { get; set; }
		public string Kieli { get; set; }
		public string RaporttiNimi { get; set; }
		public string RaporttiTiedostoNimi { get; set; }
		public string RaporttiKuvaus { get; set; }
		public string RaporttiTunnus { get; set; }
		public string Parametrit { get; set; }
		public string Tietojoukko { get; set; }
		public string Sivu { get; set; }
		public bool? Suodattimet { get; set; }
		public bool? Raporttisivut { get; set; }
		public bool? Kirjanmerkit { get; set; }
		public string Asettelu { get; set; }
		public string Nosto { get; set; }
		public string Lisatiedot { get; set; }
		public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
        public string Kuva { get; set; }
    }
}
