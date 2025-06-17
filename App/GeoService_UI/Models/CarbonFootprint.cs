using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace GeoService_UI.Models
{
    public partial class CarbonFootprint
    {
        [Key]
        public int RiviAvain { get; set; }
        public string Source { get; set; }
        public string FuelType { get; set; }
        public string Amount { get; set; }
        public string Unit { get; set; }
        public string EmissionFactor { get; set; }
        public string Date { get; set; }
        public string Username { get; set; }
    }
}
