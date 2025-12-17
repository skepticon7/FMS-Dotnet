using MediatR;

namespace UserService.Application.Common.Abstractions;

public interface ICommand<TResult> : IRequest<TResult>{}