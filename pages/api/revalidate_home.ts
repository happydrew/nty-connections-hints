// pages/api/revalidate.ts
import type { NextApiRequest, NextApiResponse } from 'next';

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
    try {
        // 触发主页重生
        console.log('Triggering homepage revalidation');
        await res.revalidate('/');
        return res.status(200).json({ revalidated: true });
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
