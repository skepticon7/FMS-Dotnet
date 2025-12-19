using MediatR;

namespace UserService.Application.Common.Abstractions;

public interface IQuery<TResult> : IRequest<TResult> { }