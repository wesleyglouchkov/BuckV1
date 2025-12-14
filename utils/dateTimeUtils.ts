export const formatTime = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const formatDate = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateTime = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    return `${formatDate(d)} ${formatTime(d)}`;
};
