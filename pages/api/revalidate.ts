// pages/api/revalidate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getArchiveUrlByDate } from '@lib/utils'

type Data = {
    revalidated?: boolean;
    archiveUrl?: string;
    message?: string;
    error?: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    // 仅允许 POST 请求
    if (req.method !== 'POST') {
        console.log(`Method: ${req.method} Not Allowed`);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { game_date } = req.body;
    console.log(`Revalidate game_date: ${game_date}`);

    if (!game_date) {
        return res.status(400).json({ message: 'Missing game_date in request body' });
    }

    // 将 "2025-03-06" 转换成 Date 对象，判断是否合法
    const date = new Date(game_date);
    if (isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Invalid game_date format' });
    }

    // 构造 archive 页面 URL，格式如下：
    // /archive/nyt-connections-hints-today-clues-help-answers-unlimited-${url_date_seg}-${game_number}
    const archiveUrl = getArchiveUrlByDate(date);
    console.log(`Archive URL: ${archiveUrl}`);

    try {
        // 触发主页重生
        console.log('Triggering homepage revalidation');
        await res.revalidate('/');

        // 触发 archive 页面重生
        console.log('Triggering archive page revalidation');
        await res.revalidate('/archive');

        // 触发 archive 具体日期页面重生
        console.log(`Triggering archiveDate page: ${archiveUrl} revalidation`);
        await res.revalidate(archiveUrl);

        return res.status(200).json({ revalidated: true, archiveUrl });
    } catch (error) {
        console.error('Revalidation error:', error);
        return res.status(500).json({
            message: `Error revalidating`,
            error: error instanceof Error ? {
                name: error.name,
                message: error.message
            } : String(error)
        });
    }
}
