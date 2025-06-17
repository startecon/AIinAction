using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public partial class Rooli
    {
        public int RooliId { get; set; }
        public string RooliNimi { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
    }

    public partial class RooliPerProfiili
    {
        [Key]
        public int RoolitId { get; set; }
        public string RooliNimi { get; set; }
        public string KayttajaNimi { get; set; }
    }

    public partial class Roolit
    {
        public int RoolitId { get; set; }
        public int Rooli_Id { get; set; }
        public int Profiili_Id { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
    }

    public partial class RooliOikeudet
    {
        public int RooliOikeudetId { get; set; }
        public int Rooli_Id { get; set; }
        public int Entiteetti_Id { get; set; }
        public int? Rivi_Id { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
    }

    public partial class Entiteetit
    {
        [Key]
        public int EntiteettiId { get; set; }
        public string EntiteettiNimi { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
    }
}
