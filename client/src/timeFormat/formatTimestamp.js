import { format, isToday, isYesterday } from 'date-fns';

export const formatTimestampOnList = (timestamp) => {
    const date = new Date(timestamp);

    // Show "Just now" for recent timestamps
    const now = new Date();
    const diffInSeconds = (now - date) / 1000;
    if (diffInSeconds < 60) return 'Just now';

    // Show "Today" or "Yesterday" for timestamps within the last 2 days
    if (isToday(date)) return format(date, 'h:mm a');;
    if (isYesterday(date)) return 'Yesterday';

    // Show formatted date for older messages
    return format(date, 'dd/MM/yy'); // Or use 'MM/dd/yy' based on locale preference
};

export const formatTimestampOnWindow = (timestamp) => {
    const date = new Date(timestamp);

    // Show formatted time (e.g., "10:45 AM")
    return format(date, 'h:mm a'); 
}