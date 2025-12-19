export const getInitials = (name) => {
    return name.split(" ").map(part => part[0]).join('').toUpperCase();
}