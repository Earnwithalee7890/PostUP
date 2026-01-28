import { z } from 'zod';

export const campaignSchema = z.object({
    id: z.string().uuid(),
    creator: z.string().startsWith('0x'),
    totalBudget: z.number().positive(),
    tasks: z.array(z.string()).min(1),
    platform: z.enum(['X', 'Farcaster', 'Base']),
    postUrl: z.string().url(),
    minFollowers: z.number().min(0).default(0),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
