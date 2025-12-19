namespace UserService.Application.Common.Caching;

public interface ICacheService
{
    Task RemoveCacheByPrefix(string prefix , CancellationToken cancellationToken = default);
}