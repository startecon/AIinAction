using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public class Profiili
    {
        public int ProfiiliId { get; set; }
        public string Username { get; set; }
        public string UI_Settings { get; set; }
        public int AsiakasAvain { get; set; }

    }

    public class ProfiiliKeyValuePair
    {
        public string Key { get; set; }
        public string Value { get; set; }
    }
}
