using System.ComponentModel.DataAnnotations;

/* Flatbuffer model object */

namespace GeoService_UI.Models
{

    /** SQL objekti **/

    public class BoxAndWhisker : object 
    {
        [Key]
        public int Id { get; set; }
        public string MeasureLabel { get; set; }
        public string MeasureDescription { get; set; }
        public string Category { get; set; }
        public string CategoryDescription { get; set; }
        public float Value { get; set; }
        public float LowerBound { get; set; }
        public float UpperBound { get; set; }
        public int Count { get; set; }
    }

    public struct BoxAndWhiskerStruct
    {
        public int Id { get; set; }
        public string MeasureLabel { get; set; }
        public string MeasureDescription { get; set; }
        public string Category { get; set; }
        public string CategoryDescription { get; set; }
        public float Value { get; set; }
        public float LowerBound { get; set; }
        public float UpperBound { get; set; }
        public int Count { get; set; }
    }

    /** Hierarkinen flatbuffers malli **/

    //[FlatBufferTable]
    //public class BoxAndWhiskerMeasure : object
    //{
    //    [FlatBufferItem(0)]
    //    public string label { get; set; }
    //    [FlatBufferItem(1)]
    //    public string description { get; set; }
    //    [FlatBufferItem(2)]
    //    public IList<BoxAndWhiskerCategory> categories { get; set; }
    //}

    //[FlatBufferTable]
    //public class BoxAndWhiskerCategory : object
    //{
    //    [FlatBufferItem(0)]
    //    public string label { get; set; }
    //    [FlatBufferItem(1)]
    //    public string description { get; set; }
    //    [FlatBufferItem(2)]
    //    public IList<HistogramBin> histogram { get; set; }
    //    [FlatBufferItem(3)]
    //    public IList<BoxAndWhiskerValues> valuebins { get; set; }
    //}

    //[FlatBufferTable]
    //public class BoxAndWhiskerValues : object
    //{
    //    [FlatBufferItem(0)]
    //    public IList<float> values { get; set; }
    //}

    //[FlatBufferStruct]
    //public class HistogramBin : object
    //{
    //    [FlatBufferItem(0)]
    //    public float lowerbound { get; set; }
    //    [FlatBufferItem(1)]
    //    public float upperbound { get; set; }
    //    [FlatBufferItem(2)]
    //    public int count { get; set; }
    //}
}