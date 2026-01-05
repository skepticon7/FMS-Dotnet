export const formatFileSize = (bytes) => {
    const size = parseFloat(bytes);

    if (size === 0) return '0 Bytes';

    if (size < 1024) {
        return `${size.toFixed(0)} Bytes`;
    } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    } else if (size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    } else if (size < 1024 * 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else {
        return `${(size / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TB`;
    }
};