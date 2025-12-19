namespace UserService.Application.Common.Pagination;

public sealed class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = [];
    public int Page {get;  init; }
    public int TotalCount {get;  init; }
    
}