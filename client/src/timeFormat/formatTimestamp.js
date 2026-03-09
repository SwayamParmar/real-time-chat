import { format, isToday, isYesterday } from 'date-fns';

export const formatTimestampOnList = (timestamp) => {
    const date = new Date(timestamp);

    const now = new Date();
    const diffInSeconds = (now - date) / 1000;
    if (diffInSeconds < 60) return 'Just now';

    if (isToday(date)) return format(date, 'h:mm a');;
    if (isYesterday(date)) return 'Yesterday';

    // Show formatted date for older messages
    return format(date, 'dd/MM/yy');
};

export const formatTimestampOnWindow = (timestamp) => {
    const date = new Date(timestamp);
    return format(date, 'h:mm a'); 
}

export const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Offline";
    const date = new Date(lastSeen);

    if (isToday(date)) return `Last seen today at ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Last seen yesterday at ${format(date, 'h:mm a')}`;
    return `Last seen ${format(date, 'dd/MM/yy')}`;
};