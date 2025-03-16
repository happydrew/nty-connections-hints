
export { getArchiveData, getCurrentDateGameInfo, getGameInfoByDate, loadAllGameInfo, type GameInfo };

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { getArchiveUrlByDate, getNextDate } from './utils';
import { GroupHint, GroupData } from './types'
import { format } from 'date-fns'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface GameInfo {
    game_date: string;
    game_number: number;
    game_author: string;
    game_data: GroupData[];
    hints: GroupHint[];
}

async function loadAllGameInfo(): Promise<{ [key: string]: GameInfo }> {
    console.log('Loading game info from file and database');
    const archiveData: { [key: string]: GameInfo } = {}
    const archiveDataFromFile = await loadGameInfoFromFile();
    //console.log(`Loaded game info from file: ${JSON.stringify(archiveDataFromFile)}`);
    const max_date = Object.keys(archiveDataFromFile).sort((a, b) => b.localeCompare(a))[0];
    //console.log(`max_date: ${max_date}`);
    const start_date = format(getNextDate(new Date(max_date)), 'yyyy-MM-dd');
    const archiveDataFromDB = await loadGameInfoFromDB(start_date);
    Object.assign(archiveData, archiveDataFromFile, archiveDataFromDB);
    return archiveData;
}

function loadGameInfoFromFile(): { [key: string]: GameInfo } {
    const archiveData: { [key: string]: GameInfo } = {}
    // 只在模块加载时读取一次 JSON 文件
    const filePath = path.join(process.cwd(), 'archive.json');
    console.log(`Loading game info from file: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const gameInfos = JSON.parse(fileContent);
    for (const gameInfo of gameInfos) {
        archiveData[`${gameInfo.game_date}`] = gameInfo;
    }
    // console.log(`Loaded game infos from file: ${JSON.stringify(archiveData)}`);
    return archiveData;
}

async function loadGameInfoFromDB(start_date: string): Promise<{ [key: string]: GameInfo }> {
    console.log(`Loading game info from database, start_date: ${start_date}`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const archiveData: { [key: string]: GameInfo } = {}
    const { data, error } = await supabase
        .from('nyt_connections_data')
        .select("*")
        .gte('game_date', start_date)

    if (error) {
        console.error('Failed to fetch game record from spabase', error);
        throw new Error('Failed to fetch game record from spabase', error);
    }

    for (const record of data) {
        const gameInfo: GameInfo = {
            game_date: record.game_date,
            game_number: record.game_number,
            game_author: record.game_author,
            game_data: JSON.parse(record.game_data),
            hints: JSON.parse(record.hints),
        }
        archiveData[`${gameInfo.game_date}`] = gameInfo;
    }
    //console.log(`Loaded game infos from database: ${JSON.stringify(archiveData)}`);
    return archiveData;
}

// 生成/archive页面时需要的数据
async function getArchiveData(): Promise<{ year: number, months: { month: number, days: { day: number, url: string }[] }[] }[]> {
    const years: { year: number, months: { month: number, days: { day: number, url: string }[] }[] }[] = []
    const archiveData = await loadAllGameInfo();
    Object.values(archiveData).forEach(gameInfo => {
        const gameDate = new Date(gameInfo.game_date);
        const year = gameDate.getFullYear();
        // 这里的月份是从 0 开始的，所以要加 1
        const month = gameDate.getMonth() + 1;
        const day = gameDate.getDate();
        const url = getArchiveUrlByDate(gameDate);
        let yearIndex = years.findIndex(yearData => yearData.year === year);
        if (yearIndex === -1) {
            yearIndex = years.push({ year, months: [] }) - 1;
        }
        let monthIndex = years[yearIndex].months.findIndex(monthData => monthData.month === month);
        if (monthIndex === -1) {
            monthIndex = years[yearIndex].months.push({ month, days: [] }) - 1;
        }
        years[yearIndex].months[monthIndex].days.push({ day, url });
    })
    years.sort((a, b) => a.year - b.year);
    years.forEach(yearData => yearData.months.sort((a, b) => a.month - b.month));
    years.forEach(yearData => yearData.months.forEach(monthData => monthData.days.sort((a, b) => a.day - b.day)));
    return years;
}

// 获取当前日期的游戏数据
async function getCurrentDateGameInfo(): Promise<GameInfo> {
    console.log(`Loading current date game info from database...`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: curDate_data, error: curDate_error } = await supabase
        .from('nyt_connections_current_date')
        .select("*")
        .order('current_date', { ascending: false })
        .limit(1)

    let currentDate = new Date();
    if (curDate_data && curDate_data.length > 0) {
        currentDate = new Date(curDate_data[0].current_date);
    }
    console.log(`get current date game info, currentDate: ${currentDate}`);

    // 根据currentDate获取游戏信息
    const gameInfoForCurrentDate = await getGameInfoByDate(currentDate);
    if (gameInfoForCurrentDate) {
        return gameInfoForCurrentDate;
    }

    // 如果没查到指定日期的数据，则返回最新一条数据
    console.log(`currentDate: ${currentDate} not found in database and file, Loading lastest game info from database...`);
    const { data: data_latest, error: error_latest } = await supabase
        .from('nyt_connections_data')
        .select("*")
        .order('game_date', { ascending: false })
        .limit(1)

    if (data_latest && data_latest.length > 0) {
        console.log(`Loaded lastest game info from database`);
        return {
            game_date: data_latest[0].game_date,
            game_number: data_latest[0].game_number,
            game_author: data_latest[0].game_author,
            game_data: JSON.parse(data_latest[0].game_data),
            hints: JSON.parse(data_latest[0].hints)
        }
    }

    console.error('Load latest game info from database failed, loading latest game info from file...');
    const archiveDataFromFile = await loadGameInfoFromFile();
    const max_number = Math.max(...Object.keys(archiveDataFromFile).map(key => parseInt(key)))
    return archiveDataFromFile[`${max_number}`];
}

// 获取指定游戏的详细信息
async function getGameInfoByDate(game_date: Date): Promise<GameInfo> {
    // 先从文件中获取数据
    const archiveDataFromFile = await loadGameInfoFromFile();
    const game_date_str = format(game_date, 'yyyy-MM-dd');
    if (archiveDataFromFile[`${game_date_str}`]) {
        console.log(`Loaded game info from file for date: ${game_date_str}`);
        return archiveDataFromFile[`${game_date_str}`];
    }
    // 再从数据库中获取数据
    console.log(`game info for date: ${game_date_str} not found in file, Loading from database...`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data, error } = await supabase
        .from('nyt_connections_data')
        .select("*")
        .eq('game_date', game_date_str)
        .limit(1)

    if (data && data.length > 0) {
        console.log(`Loaded game info from database for date: ${game_date_str}`);
        return {
            game_date: data[0].game_date,
            game_number: data[0].game_number,
            game_author: data[0].game_author,
            game_data: JSON.parse(data[0].game_data),
            hints: JSON.parse(data[0].hints)
        }
    }
    console.error(`Failed to load game info for date: ${game_date_str}, error: ${error}`);
    return null;
}




