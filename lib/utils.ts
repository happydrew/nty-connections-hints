export {
    formatDateToArchiveUrlSeg, getPreviousDate, getNextDate, getArchiveUrlByDateAndNumber,
    getPreviousDayUrl, getNextDayUrl, getFormattedDate
}

function formatDateToArchiveUrlSeg(date: Date): string {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).replace(/,/g, '').replace(/ /g, '-')
}

function getPreviousDate(date: Date): Date {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() - 1)
    return newDate
}

function getNextDate(date: Date): Date {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + 1)
    return newDate
}

function getPreviousDayUrl(game_date: string, game_number: number): string {
    return getArchiveUrlByDateAndNumber(getPreviousDate(new Date(game_date)), game_number - 1)
}

function getNextDayUrl(game_date: string, game_number: number): string {
    return getArchiveUrlByDateAndNumber(getNextDate(new Date(game_date)), game_number + 1)
}

function getArchiveUrlByDateAndNumber(game_date: Date, game_number: number): string {
    const url_date_seg = formatDateToArchiveUrlSeg(game_date)
    return `/archive/nyt-connections-hints-today-clues-help-answers-unlimited-${url_date_seg}-${game_number}`
}

function getFormattedDate(date: Date) {
    return date.toLocaleDateString('en-US', {
        year: "numeric",
        month: "long",
        day: "numeric"
    })
}