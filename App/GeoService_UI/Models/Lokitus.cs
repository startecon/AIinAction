using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public partial class Lokitus
    {
        [Key]
        public int Id { get; set; }
        public string Loki { get; set; }
        public string Username { get; set; }
        public DateTime? Created { get; set; }
    }
}