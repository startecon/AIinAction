using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public partial class FeatureGroup
    {
        [Key]
        public Int64 id { get; set; }
        public Int64 project_id { get; set; }
        public Int64? parent_feature_group_id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public int? version { get; set; }
        public int type_id { get; set; }
        public int user_id { get; set; }
        public string modified { get; set; }
        public DateTime? start_time { get; set; }
        public DateTime? end_time { get; set; }
    }

    public partial class FeatureGroupData
    {
        [Key]
        public Int64 id { get; set; }
        public string data { get; set; }
    }
}