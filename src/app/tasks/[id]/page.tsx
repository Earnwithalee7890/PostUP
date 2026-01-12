'use client';

import { useParams } from 'next/navigation';
import { useCampaign, useSubmitScreenshot } from '@/hooks/useCampaigns';
import { useState } from 'react';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { useAccount } from 'wagmi';
import { Check, Loader2, ExternalLink, Camera, CheckCircle } from 'lucide-react';
import sdk from '@farcaster/miniapp-sdk';
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

    const handleOpenLink = () => {
        if (campaign?.postUrl) {
            sdk.actions.openUrl(campaign.postUrl);
        }
    };

    const handleSubmitScreenshot = async (task: string) => {
        const screenshot = screenshots[task];
        if (!screenshot) {
            alert('Please upload a screenshot first');
            return;
        }

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div className={styles.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: 48, height: 48,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '1.2rem', color: 'white'
                        }}>
                            {campaign.rewardToken.charAt(0)}
                        </div>
                        <div>
                            <div className={styles.label}>Total Reward</div>
                            <div className={styles.value} style={{ fontSize: '1.4rem' }}>
                                {campaign.netBudget.toFixed(4)} {campaign.rewardToken}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <div className={styles.label}>Category</div>
                            <div className={styles.value}>{campaign.category}</div>
                        </div>
                        <div>
                            <div className={styles.label}>Platform</div>
                            <div className={styles.value}>{campaign.platform}</div>
                        </div>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.postPreview}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className={styles.label} style={{ marginBottom: 0 }}>TARGET ACTION</span>
                        <ExternalLink size={14} style={{ opacity: 0.6 }} />
                    </div>
                    <div
                        onClick={handleOpenLink}
                        style={{
                            color: 'var(--primary-light)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 500
                        }}
                    >
                        <span style={{ textDecoration: 'underline', wordBreak: 'break-all' }}>{campaign.postUrl || 'No link provided'}</span>
                    </div>
                </div>
            </div>

            <h3 style={{ marginBottom: '1rem', paddingLeft: '0.5rem', borderLeft: '4px solid var(--accent)' }}>Your Tasks</h3>
            <div className={styles.taskList}>
                {campaign.tasks.map(task => {
                    const isDone = completedTasks[task];
                    const hasScreenshot = !!screenshots[task];

                    return (
                        <div key={task} className={styles.taskItem}>
                            <div className={styles.taskHeader}>
                                <div className={styles.taskTitle}>
                                    <span style={{
                                        width: 24, height: 24,
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem'
                                    }}>
                                        {task === 'Follow' ? '1' : '2'}
                                    </span>
                                    {task}
                                </div>
                                {isDone ? (
                                    <div className={styles.completedBadge}>
                                        <Check size={14} /> Completed
                                    </div>
                                ) : (
                                    <button
                                        className={styles.actionBtn}
                                        onClick={handleOpenLink}
                                    >
                                        Open Link <ExternalLink size={12} />
                                    </button>
                                )}
                            </div>

                            {!isDone && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    {hasScreenshot ? (
                                        <div className={styles.previewContainer}>
                                            <img
                                                src={screenshots[task]}
                                                alt="Proof preview"
                                                className={styles.previewImage}
                                            />
                                            <label className={styles.changeBtn}>
                                                <Camera size={12} /> Change
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
                                        </div>
                                    ) : (
                                        <label className={styles.uploadZone}>
                                            <div className={styles.uploadIcon}>
                                                <Camera size={24} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.2rem' }}>
                                                    Upload Proof
                                                </div>
                                                <div style={{ fontSize: '0.8rem' }}>
                                                    Take a screenshot of your action
                                                </div>
                                            </div>
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
                                    )}

                                    {hasScreenshot && (
                                        <button
                                            className={styles.submitBtn}
                                            onClick={() => handleSubmitScreenshot(task)}
                                            disabled={uploadingTask === task}
                                        >
                                            {uploadingTask === task ? <Loader2 size={18} className="spin" /> : (
                                                <>
                                                    Submit Verification <CheckCircle size={18} />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </main >
    );
}
