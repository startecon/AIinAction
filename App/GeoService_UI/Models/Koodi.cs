using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public class Koodi
    {
        // Primary key for the Koodi entity
        [Key]
        public int KoodiAvain { get; set; }
        // Foreign key for the Koodi group entity
        public int KoodiryhmaAvain { get; set; }
        // Name of the Koodi entity in the default language
        public string KoodiNimi { get; set; }
        // Name of the Koodi entity in English
        public string KoodiNimiEN { get; set; }
        // Description of the Koodi entity in the default language
        public string KoodiKuvaus { get; set; }
        // Description of the Koodi entity in English
        public string KoodiKuvausEN { get; set; }
        // Timestamp when the Koodi entity was created
        public DateTime? Created { get; set; }
        // Timestamp when the Koodi entity was last updated
        public DateTime? Updated { get; set; }
        // Username of the user who created or last updated the Koodi entity
        public string Username { get; set; }
    }
}
