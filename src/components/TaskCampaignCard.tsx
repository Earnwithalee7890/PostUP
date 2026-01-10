'use client';

import { Campaign } from '@/lib/types';
import { useState } from 'react';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { ExternalLink, Check, Loader2 } from 'lucide-react';
import styles from './TaskCampaignCard.module.css';

interface TaskCampaignCardProps {
    campaign: Campaign;
}

export function TaskCampaignCard({ campaign }: TaskCampaignCardProps) {
    const { context } = useFarcasterContext();
    const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
    const [verifying, setVerifying] = useState<string | null>(null);

    const isEnded = campaign.status === 'completed' || campaign.status === 'claimable' || campaign.remainingBudget < campaign.rewardAmountPerTask;

    const handleVerify = async (task: string) => {
        // For browser testing: Use test FID when Farcaster context is unavailable
        const TEST_FID = 338060; // Your FID for testing
        const userFid = context?.user?.fid || TEST_FID;

        console.log('=== VERIFY TASK ===');
        console.log('User FID:', userFid);
        console.log('Task:', task);

        if (userFid === TEST_FID) {
            console.log('⚠️ Using TEST FID for browser testing');
        }

        // Note: Removed the "Please connect" check to allow testing with TEST_FID
        // In production, you may want to re-enable this check

        setVerifying(task);

        try {
            const response = await fetch('/api/verify-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: campaign.id,
                    taskType: task,
                    userFid: userFid
                })
            });

            const result = await response.json();
            console.log('Verification result:', result);

            if (result.success) {
                setCompletedTasks(prev => ({ ...prev, [task]: true }));
                alert('Task verified successfully! ✅');
            } else {
                alert(result.error || 'Verification failed. Did you complete the task?');
            }
        } catch (error) {
            console.error('Verification error:', error);
            alert('Verification failed. Please try again.');
        } finally {
            setVerifying(null);
        }
    };

    const getTaskUrl = (task: string) => {
        let url = null;

        if (task === 'Follow') {
            url = campaign.postUrl;
            // If it's just a FID number, convert to Warpcast profile URL
            if (url && /^\d+$/.test(url.trim())) {
                url = `https://warpcast.com/~/profiles/${url.trim()}`;
            }
        } else if (task === 'Like' || task === 'Repost' || task === 'Comment') {
            url = campaign.castUrl || campaign.postUrl;
        }

        return url;
    };

    return (
        <div className={`glass-panel ${styles.card}`}>
            {/* Header */}
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`${styles.platformBadge} ${styles[`platform_${campaign.platform}`]}`}>
                        {campaign.platform}
                    </span>
                    {isEnded ? (
                        <span className={styles.statusEnded}>ENDED</span>
                    ) : (
                        <span className={styles.statusActive}>ACTIVE</span>
                    )}
                    <span className={styles.category}>{campaign.category}</span>
                </div>
                <span className={styles.reward}>
                    {campaign.netBudget.toFixed(4)} {campaign.rewardToken}
                </span>
            </div>

            {/* Campaign Info */}
            <div className={styles.info}>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Net Reward Pool</span>
                    <span className={styles.value}>{campaign.netBudget.toFixed(4)} {campaign.rewardToken}</span>
                </div>
                {campaign.minFollowers && (
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Min Followers</span>
                        <span className={styles.value}>{campaign.minFollowers}</span>
                    </div>
                )}
                {campaign.requirePro && (
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Requirement</span>
                        <span className={styles.value}>Farcaster Pro Only</span>
                    </div>
                )}
            </div>

            {/* Tasks */}
            <div className={styles.tasks}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>REQUIRED ACTIONS</h4>
                {campaign.tasks.map(task => {
                    const isDone = completedTasks[task];
                    const isVerifying = verifying === task;
                    const taskUrl = getTaskUrl(task);

                    return (
                        <div key={task} className={`${styles.taskRow} ${isDone ? styles.completed : ''}`}>
                            <span className={styles.taskName}>{task}</span>

                            <div className={styles.taskActions}>
                                {/* Action Button */}
                                {taskUrl && (
                                    <a
                                        href={taskUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.actionBtn}
                                        onClick={(e) => {
                                            // Also open when clicking verify for Follow
                                            if (task === 'Follow') {
                                                e.stopPropagation();
                                            }
                                        }}
                                    >
                                        {task} <ExternalLink size={12} />
                                    </a>
                                )}

                                {/* Verify Button */}
                                {isDone ? (
                                    <button className={`${styles.verifyBtn} ${styles.verified}`} disabled>
                                        <Check size={14} /> Done
                                    </button>
                                ) : (
                                    <button
                                        className={styles.verifyBtn}
                                        onClick={() => handleVerify(task)}
                                        disabled={isVerifying || isEnded}
                                    >
                                        {isVerifying ? <Loader2 size={14} className="spin" /> : 'Verify'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
