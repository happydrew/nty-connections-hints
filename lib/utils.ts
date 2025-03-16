export {
    formatDateToArchiveUrlSeg, getPreviousDate, getNextDate, getArchiveUrlByDate,
    getPreviousDayUrl, getNextDayUrl, getFormattedDate,getArchiveUrlSlugByDate
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
    return getArchiveUrlByDate(getPreviousDate(new Date(game_date)))
}

function getNextDayUrl(game_date: string, game_number: number): string {
    return getArchiveUrlByDate(getNextDate(new Date(game_date)))
}

function getArchiveUrlByDate(game_date: Date): string {
    return `/archive/${getArchiveUrlSlugByDate(game_date)}`
}

function getArchiveUrlSlugByDate(game_date: Date): string {
    const url_date_seg = formatDateToArchiveUrlSeg(game_date)
    return `nyt-connections-hints-today-answers-clues-help-unlimited-${url_date_seg}`
}

function getFormattedDate(date: Date) {
    return date.toLocaleDateString('en-US', {
        year: "numeric",
        month: "long",
        day: "numeric"
    })
}