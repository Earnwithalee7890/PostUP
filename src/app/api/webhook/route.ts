import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
    return NextResponse.json({ status: 'ok', message: 'Webhook received' });
}

export async function GET(_req: NextRequest) {
    return NextResponse.json({ status: 'ok', message: 'Webhook endpoint active' });
}
