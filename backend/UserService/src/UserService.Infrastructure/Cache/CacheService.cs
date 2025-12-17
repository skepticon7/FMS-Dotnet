using StackExchange.Redis;
using UserService.Application.Common.Caching;

namespace UserService.Infrastructure.Cache;

public class CacheService(IConnectionMultiplexer _redis) : ICacheService
{
    
    
    public async Task RemoveCacheByPrefix(string prefix, CancellationToken cancellationToken = default)
    {
        var server = _redis.GetServer(_redis.GetEndPoints().First());
        var db = _redis.GetDatabase();
        foreach (var key in server.Keys(pattern: $"{prefix}*"))
        {
            await db.KeyDeleteAsync(key);
        }
    }
}