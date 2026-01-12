import { Campaign } from '@/lib/types';
import Link from 'next/link';
import styles from './CampaignCard.module.css';
import { ExternalLink, Image } from 'lucide-react';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { useAccount } from 'wagmi';
import { isAdmin } from '@/lib/admin';

export function CampaignCard({ campaign }: { campaign: Campaign }) {
    const { context } = useFarcasterContext();
    const { address } = useAccount();
    const isUserAdmin = isAdmin(address, context?.user?.fid);

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
                    {campaign.netBudget.toFixed(4)} {campaign.rewardToken}
                </span>
            </div>

            <div className={styles.content}>
                {campaign.tasks.includes('Follow') && campaign.postUrl ? (
                    <a
                        href={`/tasks/${campaign.id}`}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.2rem',
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        FOLLOW <ExternalLink size={14} />
                    </a>
                ) : campaign.postUrl ? (
                    <a href={`/tasks/${campaign.id}`} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1.2rem',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textDecoration: 'none'
                    }}>
                        Start Task <ExternalLink size={14} />
                    </a>
                ) : (
                ) : (
                    <span style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>No URL provided</span>
                )}
                
                {/* Admin/Creator View: Submissions */}
                {isUserAdmin && (
                    <Link 
                        href={`/campaigns/${campaign.id}/submissions`}
                        style={{
                            padding: '0.6rem',
                            borderRadius: '0.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--muted-foreground)',
                            border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="View Submissions (Admin Only)"
                    >
                        <Image size={18} />
                    </Link>
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
                        <span>Reward Pool</span>
                        <span>{campaign.netBudget.toFixed(4)} {campaign.rewardToken}</span>
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
        </div >
    );
}
