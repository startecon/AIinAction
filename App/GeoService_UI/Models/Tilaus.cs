using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Models
{
    public class Tilaus
    {
        [Key]
        public int RowId { get; set; }
        public string Id { get; set; }
        public string SandboxType { get; set; }
        public string StoreFront { get; set; }
        public string FulfillmentId { get; set; }
        public string SessionId { get; set; }
        public string AllowedCustomerOperations { get; set; }
        public bool? IsFreeTrial { get; set; }
        public bool? IsTest { get; set; }
        public bool? AutoRenew { get; set; }
        public string Term { get; set; }
        public int? Quantity { get; set; }
        public string PlanId { get; set; }
        public string Purchaser { get; set; }
        public string Beneficiary { get; set; }
        public string SaasSubscriptionStatus { get; set; }
        public string Name { get; set; }
        public string OfferId { get; set; }
        public string PublisherId { get; set; }
        public DateTimeOffset? Created { get; set; }
        public string SessionMode { get; set; }
        public string TenantId { get; set; }
    }
}
