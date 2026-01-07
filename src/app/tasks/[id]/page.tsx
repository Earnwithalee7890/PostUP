'use client';

import { useParams } from 'next/navigation';
import { useCampaign, useCompleteTask } from '@/hooks/useCampaigns';
import { useState } from 'react';
import { Check, Loader2, ExternalLink } from 'lucide-react';
import styles from './task.module.css';

export default function TaskExecutionPage() {
    const { id } = useParams() as { id: string };
    const { data: campaign, isLoading } = useCampaign(id);
    const completeMutation = useCompleteTask();

    const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
    const [verifying, setVerifying] = useState<string | null>(null);

    const handleVerify = (task: string) => {
        setVerifying(task);
        completeMutation.mutate({ campaignId: id, taskType: task }, {
            onSuccess: () => {
                setCompletedTasks(prev => ({ ...prev, [task]: true }));
                setVerifying(null);
            },
            onError: () => {
                alert('Verification failed. Did you complete the task?');
                setVerifying(null);
            }
        });
    };

    if (isLoading) return <div className="flex-center full-screen">Loading...</div>;
    if (!campaign) return <div className="flex-center full-screen">Campaign not found</div>;

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <span className="gradient-text" style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                    {campaign.platform} Campaign
                </span>
            </div>

            <div className={`glass-panel ${styles.rewardCard}`}>
                <div style={{ marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Total Potential Reward</div>
                <div className={styles.rewardAmount}>
                    {(campaign.rewardAmountPerTask * campaign.tasks.length).toFixed(2)} {campaign.rewardToken}
                </div>
            </div>

            <div className={styles.postPreview}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>TARGET POST</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <a href={campaign.postUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>
                        {campaign.postUrl}
                    </a>
                    <ExternalLink size={14} />
                </div>
            </div>

            <h3 style={{ marginBottom: '1rem' }}>Required Actions</h3>
            <div className={styles.taskList}>
                {campaign.tasks.map(task => {
                    const isDone = completedTasks[task];
                    const isVerifying = verifying === task;

                    return (
                        <div key={task} className={`${styles.taskItem} ${isDone ? styles.completed : ''}`}>
                            <span style={{ fontWeight: 600 }}>{task}</span>

                            {isDone ? (
                                <button className={`${styles.verifyBtn} ${styles.success}`} disabled>
                                    <Check size={16} style={{ marginRight: '4px' }} /> Done
                                </button>
                            ) : (
                                <button
                                    className={styles.verifyBtn}
                                    onClick={() => handleVerify(task)}
                                    disabled={isVerifying}
                                >
                                    {isVerifying ? <Loader2 size={16} className="spin" /> : 'Verify'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
