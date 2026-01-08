import { Campaign } from '@/lib/types';
import styles from './CampaignCard.module.css';
import { ExternalLink } from 'lucide-react';

export function CampaignCard({ campaign }: { campaign: Campaign }) {
    const isX = campaign.platform === 'X';

    // Status Determination
    const isEnded = campaign.status === 'completed' || campaign.status === 'claimable' || campaign.remainingBudget < campaign.rewardAmountPerTask;

    // Progress
    const progress = ((campaign.totalBudget - campaign.remainingBudget) / campaign.totalBudget) * 100;

    return (
        <div className={`glass-panel ${styles.card}`}>
            <div className={styles.header}>
                <div className="flex-center" style={{ gap: '0.5rem' }}>
                    <span className={`${styles.platformBadge} ${isX ? styles.platform_X : styles.platform_Farcaster}`}>
                        {campaign.platform}
                    </span>
                    {isEnded && (
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: 'rgba(231, 15, 15, 0.2)',
                            color: '#ff6b6b',
                            border: '1px solid rgba(231, 15, 15, 0.4)',
                            fontWeight: 600
                        }}>
                            ENDED
                        </span>
                    )}
                    {!isEnded && (
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: 'rgba(46, 204, 113, 0.2)',
                            color: '#2ecc71',
                            border: '1px solid rgba(46, 204, 113, 0.4)',
                            fontWeight: 600
                        }}>
                            ACTIVE
                        </span>
                    )}
                </div>

                <span className={styles.reward}>
                    {campaign.rewardAmountPerTask} {campaign.rewardToken}
                </span>
            </div>

            <div className={styles.content}>
                {campaign.postUrl ? (
                    <a href={campaign.postUrl} target="_blank" rel="noopener noreferrer" className="flex-center" style={{ gap: '0.5rem', wordBreak: 'break-all', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                        Post #{campaign.id.slice(0, 8)} <ExternalLink size={12} />
                    </a>
                ) : (
                    <span style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>No URL provided</span>
                )}
            </div>

            <div className={styles.tasks}>
                {campaign.tasks.map(t => (
                    <span key={t} className={styles.taskTag}>{t}</span>
                ))}
            </div>

            <div className={styles.footer}>
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                        <span>Progress</span>
                        <span>{campaign.remainingBudget.toFixed(2)} left</span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${Math.min(progress, 100)}%`,
                            height: '100%',
                            background: 'var(--accent)',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
