
export { getArchiveData, getLatestGameInfo, getGameInfoByNumber, loadAllGameInfo, type GameInfo };

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { getArchiveUrlByDateAndNumber } from './utils';
import {GroupHint,GroupData} from './types'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface GameInfo {
    game_date: string;
    game_number: number;
    game_author: string;
    game_data: GroupData[];
    hints: GroupHint[];
}

async function loadAllGameInfo(): Promise<{ [key: number]: GameInfo }> {
    console.log('Loading game info from file and database');
    const archiveData: { [key: number]: GameInfo } = {}
    const archiveDataFromFile = await loadGameInfoFromFile();
    const max_number = Math.max(...Object.keys(archiveDataFromFile).map(key => parseInt(key)))
    const archiveDataFromDB = await loadGameInfoFromDB(max_number + 1);
    Object.assign(archiveData, archiveDataFromFile, archiveDataFromDB);
    return archiveData;
}

function loadGameInfoFromFile(): { [key: number]: GameInfo } {
    const archiveData: { [key: number]: GameInfo } = {}
    // 只在模块加载时读取一次 JSON 文件
    const filePath = path.join(process.cwd(), 'archive.json');
    console.log(`Loading game info from file: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const gameInfos = JSON.parse(fileContent);
    for (const gameInfo of gameInfos) {
        archiveData[`${gameInfo.game_number}`] = gameInfo;
    }
    // console.log(`Loaded game infos from file: ${JSON.stringify(archiveData)}`);
    return archiveData;
}

async function loadGameInfoFromDB(start_number: number): Promise<{ [key: number]: GameInfo }> {
    console.log(`Loading game info from database, start_number: ${start_number}`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const archiveData: { [key: number]: GameInfo } = {}
    const { data, error } = await supabase
        .from('nyt_connections_data')
        .select("*")
        .gte('game_number', start_number)

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
        archiveData[`${gameInfo.game_number}`] = gameInfo;
    }
    console.log(`Loaded game infos from database: ${JSON.stringify(archiveData)}`);
    return archiveData;
}

// 生成/archive页面时需要的数据
async function getArchiveData(): Promise<{ year: number, months: { month: number, days: { day: number, url: string }[] }[] }[]> {
    const years: { year: number, months: { month: number, days: { day: number, url: string }[] }[] }[] = []
    const archiveData = await loadAllGameInfo();
    Object.values(archiveData).forEach(gameInfo => {
        const gameDate = new Date(gameInfo.game_date);
        const year = new Date(gameDate).getFullYear();
        // 这里的月份是从 0 开始的，所以要加 1
        const month = new Date(gameDate).getMonth() + 1;
        const day = new Date(gameDate).getDate();
        const url = getArchiveUrlByDateAndNumber(new Date(gameDate), gameInfo.game_number);
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

// 获取最新一条数据
async function getLatestGameInfo(): Promise<GameInfo> {
    console.log(`Loading lates game info from database...`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data, error } = await supabase
        .from('nyt_connections_data')
        .select("*")
        .order('game_number', { ascending: false })
        .limit(1)

    if (data && data.length > 0) {
        return {
            game_date: data[0].game_date,
            game_number: data[0].game_number,
            game_author: data[0].game_author,
            game_data: JSON.parse(data[0].game_data),
            hints: JSON.parse(data[0].hints)
        }
    } else {
        console.error('Failed to fetch game record from spabase, or no data found, loadding from file', error);
        const archiveDataFromFile = await loadGameInfoFromFile();
        const max_number = Math.max(...Object.keys(archiveDataFromFile).map(key => parseInt(key)))
        return archiveDataFromFile[`${max_number}`];
    }
}

// 获取指定游戏的详细信息
async function getGameInfoByNumber(game_number: number): Promise<GameInfo> {
    // 先从文件中获取数据
    console.log(`Loading game info from file for game_number: ${game_number}`);
    const archiveDataFromFile = await loadGameInfoFromFile();
    if (archiveDataFromFile[`${game_number}`]) {
        console.log(`Loaded game info from file for game_number: ${game_number}`);
        return archiveDataFromFile[`${game_number}`];
    }
    // 再从数据库中获取数据
    console.log(`game_number: ${game_number} not found in file, Load from database...`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data, error } = await supabase
        .from('nyt_connections_data')
        .select("*")
        .eq('game_number', game_number)

    if (data && data.length > 0) {
        console.log(`Loaded game info from database for game_number: ${game_number}`);
        return {
            game_date: data[0].game_date,
            game_number: data[0].game_number,
            game_author: data[0].game_author,
            game_data: JSON.parse(data[0].game_data),
            hints: JSON.parse(data[0].hints)
        }
    } else {
        console.error('Failed to fetch game record from spabase, or no data found, loadding from file', error);
        return null;
    }
}




