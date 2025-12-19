using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using UserService.Application.Common.Abstractions;

namespace UserService.Application.Decorators;

public class CachedQueryHandlerDecorator<TQuery, TResult>
    (IQueryHandler<TQuery, TResult> inner, IDistributedCache cache)
    : IRequestHandler<TQuery, TResult>
    where TQuery : IQuery<TResult>
{
    public async Task<TResult> Handle(TQuery query, CancellationToken cancellationToken)
    {
        if (query is not ICachedQuery)
            return await inner.Handle(query, cancellationToken);

        
        var cacheKey = $"{typeof(TQuery).Name}:{JsonConvert.SerializeObject(query)}";
        var cachedData = await cache.GetStringAsync(cacheKey, cancellationToken);
        
        if (cachedData != null)
            return JsonConvert.DeserializeObject<TResult>(cachedData)!;
        
        var result = await inner.Handle(query, cancellationToken);

        await cache.SetStringAsync(
            cacheKey,
            JsonConvert.SerializeObject(result),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
            }
        );
        return result;
    }
}