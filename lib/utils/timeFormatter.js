import { format, formatDistance, formatRelative } from 'date-fns'

// Format time to HH:MM:SS
export const formatTime = (date) => {
    if (!date) return '-'
    return format(new Date(date), 'HH:mm:ss')
}

// Format time to HH:MM
export const formatTimeShort = (date) => {
    if (!date) return '-'
    return format(new Date(date), 'HH:mm')
}

// Format date to readable format
export const formatDate = (date) => {
    if (!date) return '-'
    return format(new Date(date), 'MMM dd, yyyy')
}

// Format date to YYYY-MM-DD
export const formatDateISO = (date) => {
    if (!date) return ''
    return format(new Date(date), 'yyyy-MM-dd')
}

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
    if (!date) return '-'
    return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

// Format datetime
export const formatDateTime = (date) => {
    if (!date) return '-'
    return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

// Get time difference in hours
export const getHoursDifference = (start, end) => {
    if (!start || !end) return 0
    const diff = new Date(end) - new Date(start)
    return diff / (1000 * 60 * 60)
}

// Get time difference in minutes
export const getMinutesDifference = (start, end) => {
    if (!start || !end) return 0
    const diff = new Date(end) - new Date(start)
    return diff / (1000 * 60)
}
