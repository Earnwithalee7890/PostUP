import { QualityScore, getTierLabel, getTierColor } from '@/lib/qualityScore';

interface ReputationBadgeProps {
    qualityScore: QualityScore;
    showBonus?: boolean;
}

export function ReputationBadge({ qualityScore, showBonus = false }: ReputationBadgeProps) {
    const { score, tier, breakdown } = qualityScore;
    const tierLabel = getTierLabel(tier);
    const tierColor = getTierColor(tier);

    const boost = score - 1.0;

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            background: `${tierColor}15`,
            border: `1px solid ${tierColor}40`,
            borderRadius: '99px',
            fontSize: '0.85rem',
        }}>
            <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: tierColor,
            }} />
            <span style={{ fontWeight: 600, color: tierColor }}>
                {tierLabel}
            </span>
            {showBonus && boost > 0 && (
                <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>
                    +{boost.toFixed(1)} boost
                </span>
            )}
        </div>
    );
}

interface ScoreBreakdownProps {
    qualityScore: QualityScore;
}

export function ScoreBreakdown({ qualityScore }: ScoreBreakdownProps) {
    const { breakdown } = qualityScore;

    const items = [
        { label: 'Base', value: breakdown.base, always: true },
        { label: 'Account Age', value: breakdown.ageBonus },
        { label: 'Followers', value: breakdown.followerBonus },
        { label: 'Verified', value: breakdown.verifiedBonus },
        { label: 'ETH Activity', value: breakdown.ethActivityBonus },
        { label: 'Task History', value: breakdown.taskHistoryBonus },
        { label: 'Spam-Free', value: breakdown.spamFreeBonus },
    ].filter(item => item.always || item.value > 0);

    return (
        <div className="glass-panel" style={{ padding: '1rem' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>
                Quality Score Breakdown
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map((item, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                    }}>
                        <span style={{ color: 'var(--muted-foreground)' }}>{item.label}</span>
                        <span style={{ fontWeight: 600, color: item.value > 0 ? 'var(--primary-light)' : 'white' }}>
                            {item.value > 0 && '+'}{item.value.toFixed(1)}
                        </span>
                    </div>
                ))}
                <div style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                }}>
                    <span>Total Score</span>
                    <span style={{ color: 'var(--primary-light)' }}>{qualityScore.score.toFixed(1)}</span>
                </div>
            </div>
        </div>
    );
}
