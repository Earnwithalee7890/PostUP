'use client';

import { useParams } from 'next/navigation';
import { useCampaign, useSubmitScreenshot } from '@/hooks/useCampaigns';
import { useState } from 'react';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { useAccount } from 'wagmi';
import { Check, Loader2, ExternalLink, Camera } from 'lucide-react';
import styles from './task.module.css';

export default function TaskExecutionPage() {
    const { id } = useParams() as { id: string };
    const { data: campaign, isLoading } = useCampaign(id);
    const { mutateAsync: submitScreenshot } = useSubmitScreenshot();
    const { context } = useFarcasterContext();
    const { address } = useAccount();

    const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
    const [screenshots, setScreenshots] = useState<Record<string, string>>({});
    const [uploadingTask, setUploadingTask] = useState<string | null>(null);

    const handleScreenshotUpload = (task: string, file: File) => {
        const userFid = context?.user?.fid;

        if (!userFid) {
            alert('Please connect your Farcaster account');
            return;
        }

        // Convert to base64 for preview and storage
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setScreenshots(prev => ({ ...prev, [task]: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitScreenshot = async (task: string) => {
        const screenshot = screenshots[task];
        if (!screenshot) {
            alert('Please upload a screenshot first');
            return;
        }

        setUploadingTask(task);

        setUploadingTask(task);

        try {
            // Updated: Actually submit to backend (MockService)
            await submitScreenshot({
                campaignId: id,
                taskId: task,
                screenshot: screenshot,
                userFid: context?.user?.fid!,
                address: address || '0x0000000000000000000000000000000000000000'
            });

            setCompletedTasks(prev => ({ ...prev, [task]: true }));
            alert('Screenshot submitted successfully! ✅');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to submit screenshot. Please try again.');
        } finally {
            setUploadingTask(null);
        }
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

            <div className={`glass-panel`} style={{ marginBottom: '1rem', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Campaign Info</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--muted-foreground)' }}>Category</span>
                        <span>{campaign.category}</span>
                    </div>
                    {campaign.minFollowers > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Min Followers</span>
                            <span>{campaign.minFollowers}</span>
                        </div>
                    )}
                    {campaign.requirePro && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Requirement</span>
                            <span>Farcaster Pro Only</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--muted-foreground)' }}>Net Reward Pool</span>
                        <span>{campaign.netBudget.toFixed(4)} {campaign.rewardToken}</span>
                    </div>
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

                    // Determine the link URL based on task type
                    const getTaskUrl = () => {
                        if (task === 'Follow') return campaign.postUrl; // Profile URL
                        if (task === 'Like' || task === 'Repost' || task === 'Comment') return campaign.castUrl || campaign.postUrl;
                        return null;
                    };

                    const taskUrl = getTaskUrl();

                    return (
                        <div key={task} className={`${styles.taskItem} ${isDone ? styles.completed : ''}`}>
                            {taskUrl ? (
                                <a
                                    href={taskUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        fontWeight: 600,
                                        color: 'var(--primary-light)',
                                        textDecoration: 'underline',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    {task} <ExternalLink size={14} />
                                </a>
                            ) : (
                                <span style={{ fontWeight: 600 }}>{task}</span>
                            )}

                            {isDone ? (
                                <button className={`${styles.verifyBtn} ${styles.success}`} disabled>
                                    <Check size={16} style={{ marginRight: '4px' }} /> Done
                                </button>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', width: '100%' }}>
                                    {screenshots[task] && (
                                        <img
                                            src={screenshots[task]}
                                            alt="Task screenshot"
                                            style={{ maxWidth: '100px', maxHeight: '60px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}
                                        />
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', alignItems: 'flex-end' }}>
                                        {!isDone && !screenshots[task] && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                                                📸 Proof Required
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '0.5rem', width: 'auto' }}>
                                            <label className={styles.uploadBtn}>
                                                <Camera size={14} style={{ marginRight: '6px' }} />
                                                {screenshots[task] ? 'Change Proof' : 'Upload Proof'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleScreenshotUpload(task, file);
                                                    }}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                            {screenshots[task] && (
                                                <button
                                                    className={styles.verifyBtn}
                                                    onClick={() => handleSubmitScreenshot(task)}
                                                    disabled={uploadingTask === task}
                                                >
                                                    {uploadingTask === task ? <Loader2 size={16} className="spin" /> : 'Submit Verification'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
