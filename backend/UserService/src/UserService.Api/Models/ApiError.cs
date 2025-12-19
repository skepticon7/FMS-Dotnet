namespace UserService.Api.Models;

public class ApiError
{
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime timestamp { get; set; } = DateTime.UtcNow;
}