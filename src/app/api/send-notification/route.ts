import { NextRequest, NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || '';

interface NotificationRequest {
    title: string;
    body: string;
    targetUrl?: string;
    fids?: number[]; // If empty, send to all users who added the app
}

export async function POST(req: NextRequest) {
    try {
        const { title, body, targetUrl, fids }: NotificationRequest = await req.json();

        if (!title || !body) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
        }

        if (!NEYNAR_API_KEY) {
            return NextResponse.json({ error: 'NEYNAR_API_KEY not configured' }, { status: 500 });
        }

        // Send notification via Neynar
        const response = await fetch('https://api.neynar.com/v2/farcaster/notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api_key': NEYNAR_API_KEY,
            },
            body: JSON.stringify({
                title,
                body,
                target_url: targetUrl || 'https://post-up-zeta.vercel.app',
                fids: fids || [], // Empty = all users who added the mini app
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Neynar notification error:', error);
            return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
        }

        const result = await response.json();
        return NextResponse.json({ success: true, result });

    } catch (error) {
        console.error('Notification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
