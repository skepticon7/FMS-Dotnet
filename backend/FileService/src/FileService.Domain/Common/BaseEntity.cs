using System.ComponentModel.DataAnnotations.Schema;

namespace FileService.Domain.Common
{
    // All Entities that need to raise events (like "File Uploaded") inherit from this.
    public abstract class BaseEntity
    {
        // This list holds events in memory until we save to the DB.
        // [NotMapped] means "Don't create a column for this in the database table".
        [NotMapped]
        public List<DomainEvent> DomainEvents { get; private set; } = new List<DomainEvent>();

        public void AddDomainEvent(DomainEvent domainEvent)
        {
            DomainEvents.Add(domainEvent);
        }

        public void RemoveDomainEvent(DomainEvent domainEvent)
        {
            DomainEvents.Remove(domainEvent);
        }

        public void ClearDomainEvents()
        {
            DomainEvents.Clear();
        }
    }

    // The blueprint for an Event
    public abstract class DomainEvent
    {
        public DateTime OccurredOn { get; protected set; } = DateTime.UtcNow;
    }
}