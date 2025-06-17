using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace GeoService_UI.Models
{
    public partial class Tila
    {
        [Key]
        public int TilaAvain { get; set; }
        public string Tilanimi { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
        public string Username { get; set; }
        public bool? Active { get; set; }
    }
}
