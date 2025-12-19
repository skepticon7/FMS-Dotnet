export const getTwoRandomElements = (array) => {
    if (array.length < 2) {
        throw new Error('Array must have at least 2 elements');
    }

    const copy = [...array];

    const firstIndex = Math.floor(Math.random() * copy.length);
    const firstElement = copy.splice(firstIndex, 1)[0];

    const secondIndex = Math.floor(Math.random() * copy.length);
    const secondElement = copy[secondIndex];

    return [firstElement, secondElement];
};