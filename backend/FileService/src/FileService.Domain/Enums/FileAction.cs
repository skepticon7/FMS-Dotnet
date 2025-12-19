namespace FileService.Domain.Enums
{
    public enum FileAction
    {
        Created,
        Updated,
        Deleted,
        Restored,
        Downloaded // Good for audit trails!
    }
}