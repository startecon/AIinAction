using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public partial class ProsessiTaulu
    {
        [Key]
        public int TauluAvain { get; set; }
        public string TauluJSON { get; set; }
    }
}
