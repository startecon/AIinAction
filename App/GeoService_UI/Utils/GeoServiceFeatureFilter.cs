using Microsoft.AspNetCore.Http;
using Microsoft.FeatureManagement;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService_UI.Utils
{
    public class GeoServiceFeatureFilter : IFeatureFilter, IContextualFeatureFilter<object>
    {
        private readonly IHttpContextAccessor httpContextAccessor;

        public GeoServiceFeatureFilter(IHttpContextAccessor httpContextAccessor)
        {
            httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        public Task<bool> EvaluateAsync(FeatureFilterEvaluationContext featureFilterContext, object appContext)
        {
            return Task.FromResult(false);
        }

        public Task<bool> EvaluateAsync(FeatureFilterEvaluationContext context)
        {
            return Task.FromResult(false);
        }
    }
}
