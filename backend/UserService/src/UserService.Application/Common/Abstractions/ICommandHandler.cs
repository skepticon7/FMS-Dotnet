using MediatR;

namespace UserService.Application.Common.Abstractions;

public interface ICommandHandler<TCommand , TResult> : IRequestHandler<TCommand , TResult> where TCommand : ICommand<TResult>
{
    Task<TResult> Handle(TCommand command, CancellationToken cancellationToken);
}