using MediatR;

namespace UserService.Application.Common.Abstractions;

public interface IQueryHandler<TQuery, TResult> : IRequestHandler<TQuery , TResult> where TQuery : IQuery<TResult>
{
    Task<TResult> Handle(TQuery query, CancellationToken cancellationToken);
}