import { NextRequest, NextResponse } from 'next/server';
import { verifyTask } from '@/lib/verifyTask';
import { MockService } from '@/lib/mockService';
import { TaskType } from '@/lib/types';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { campaignId, taskType, userFid } = body;

        console.log('=== VERIFY TASK API ===');
        console.log('Received:', { campaignId, taskType, userFid });

        if (!campaignId || !taskType || !userFid) {
            console.error('Missing required fields:', { campaignId, taskType, userFid });
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get campaign details
        const campaign = await MockService.getCampaign(campaignId);
        if (!campaign) {
            console.error('Campaign not found:', campaignId);
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        console.log('Campaign found:', {
            id: campaign.id,
            postUrl: campaign.postUrl,
            castUrl: campaign.castUrl
        });

        // Verify task completion
        console.log('Calling verifyTask with:', {
            userFid: parseInt(userFid),
            taskType,
            postUrl: campaign.postUrl,
            castUrl: campaign.castUrl
        });

        const result = await verifyTask(
            parseInt(userFid),
            taskType as TaskType,
            campaign.postUrl,
            campaign.castUrl
        );

        console.log('Verification result:', result);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || 'Task verification failed' },
                { status: 400 }
            );
        }

        // TODO: Store completion in database
        // await SupabaseService.recordTaskCompletion(campaignId, userFid, taskType);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Task verification error:', error);
        return NextResponse.json(
            { success: false, error: `Internal server error: ${error}` },
            { status: 500 }
        );
    }
}
