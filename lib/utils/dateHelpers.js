import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    addDays,
    subDays,
    isWithinInterval,
    isSameDay
} from 'date-fns'

// Get today's date range
export const getTodayRange = () => {
    const now = new Date()
    return {
        start: startOfDay(now),
        end: endOfDay(now),
    }
}

// Get this week's date range
export const getThisWeekRange = () => {
    const now = new Date()
    return {
        start: startOfWeek(now),
        end: endOfWeek(now),
    }
}

// Get this month's date range
export const getThisMonthRange = () => {
    const now = new Date()
    return {
        start: startOfMonth(now),
        end: endOfMonth(now),
    }
}

// Get this year's date range
export const getThisYearRange = () => {
    const now = new Date()
    return {
        start: startOfYear(now),
        end: endOfYear(now),
    }
}

// Get custom date range
export const getCustomRange = (startDate, endDate) => {
    return {
        start: startOfDay(new Date(startDate)),
        end: endOfDay(new Date(endDate)),
    }
}

// Check if date is within range
export const isDateInRange = (date, startDate, endDate) => {
    return isWithinInterval(new Date(date), {
        start: new Date(startDate),
        end: new Date(endDate),
    })
}

// Check if date is today
export const isToday = (date) => {
    return isSameDay(new Date(date), new Date())
}

// Get date N days ago
export const getDaysAgo = (days) => {
    return subDays(new Date(), days)
}

// Get date N days from now
export const getDaysFromNow = (days) => {
    return addDays(new Date(), days)
}
