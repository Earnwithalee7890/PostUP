import { z } from 'zod';

export const userStatsSchema = z.object({
    totalTasks: z.number().min(0),
    totalEarned: z.number().min(0),
    neynarScore: z.number().min(0).max(100).optional(),
    isSpam: z.boolean().default(false),
    verifications: z.array(z.string()).default([]),
});

export type UserStatsInput = z.infer<typeof userStatsSchema>;
