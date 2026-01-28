import { describe, it, expect } from 'vitest';
import { calculateQualityScore } from '../src/lib/qualityScore';

describe('Quality Score Calculation', () => {
    it('should return base score for new users', () => {
        const score = calculateQualityScore({
            fid: 123,
            accountAge: 0,
            followerCount: 0,
            isVerified: false,
            hasEthActivity: false,
            completedTasks: 0,
            hasSpamFlags: false
        });
        expect(score.score).toBeGreaterThan(0);
    });
});
