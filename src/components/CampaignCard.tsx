import { Campaign } from '@/lib/types';
import Link from 'next/link';
import styles from './CampaignCard.module.css';
import { ExternalLink, Image, Camera, Check, Loader2, CheckCircle } from 'lucide-react';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { useAccount } from 'wagmi';
import { isAdmin } from '@/lib/admin';
import { useState } from 'react';
import { useSubmitScreenshot } from '@/hooks/useCampaigns';
import sdk from '@farcaster/miniapp-sdk';

export function CampaignCard({ campaign }: { campaign: Campaign }) {
    const { context } = useFarcasterContext();
    const { address } = useAccount();
    const isUserAdmin = isAdmin(address, context?.user?.fid);
    const { mutateAsync: submitScreenshot } = useSubmitScreenshot();

    const [screenshots, setScreenshots] = useState<Record<string, string>>({});
    const [uploadingTask, setUploadingTask] = useState<string | null>(null);
    const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

    const isX = campaign.platform === 'X';
    const isEnded = campaign.status === 'completed' || campaign.status === 'claimable' || campaign.remainingBudget < campaign.rewardAmountPerTask;
    const progress = ((campaign.totalBudget - campaign.remainingBudget) / campaign.totalBudget) * 100;

    const handleOpenLink = () => {
        if (campaign?.postUrl) {
            sdk.actions.openUrl(campaign.postUrl);
        }
    };

    const handleScreenshotUpload = (task: string, file: File) => {
        const userFid = context?.user?.fid;
        if (!userFid) {
            alert('Please connect your Farcaster account');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setScreenshots(prev => ({ ...prev, [task]: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitScreenshot = async (task: string) => {
        const screenshot = screenshots[task];
        if (!screenshot) return;

        setUploadingTask(task);
        try {
            await submitScreenshot({
                campaignId: campaign.id,
                taskId: task,
                screenshot: screenshot,
                userFid: context?.user?.fid!,
                address: address || '0x0000000000000000000000000000000000000000'
            });
            setCompletedTasks(prev => ({ ...prev, [task]: true }));
            alert('Screenshot submitted successfully! ✅');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to submit screenshot.');
        } finally {
            setUploadingTask(null);
        }
    };

    return (
        <div className={`glass-panel ${styles.card}`}>
            <div className={styles.header}>
                <div className="flex-center" style={{ gap: '0.5rem' }}>
                    <span className={`${styles.platformBadge} ${isX ? styles.platform_X : styles.platform_Farcaster}`}>
                        {campaign.platform}
                    </span>
                    {isEnded ? (
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: 'rgba(231, 15, 15, 0.2)',
                            color: '#ff6b6b',
                            border: '1px solid rgba(231, 15, 15, 0.4)',
                            fontWeight: 600
                        }}>ENDED</span>
                    ) : (
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: 'rgba(46, 204, 113, 0.2)',
                            color: '#2ecc71',
                            border: '1px solid rgba(46, 204, 113, 0.4)',
                            fontWeight: 600
                        }}>ACTIVE</span>
                    )}
                </div>
                <span className={styles.reward}>
                    {campaign.netBudget.toFixed(4)} {campaign.rewardToken}
                </span>
            </div>

            <div className={styles.content} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                {/* Action Link */}
                {campaign.postUrl ? (
                    <button
                        onClick={handleOpenLink}
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
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {campaign.tasks.includes('Follow') ? 'FOLLOW' : 'OPEN LINK'} <ExternalLink size={14} />
                    </button>
                ) : (
                    <span style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>No URL provided</span>
                )}

                {/* Inline Tasks & Submission */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                    {campaign.tasks.map(task => {
                        const isDone = completedTasks[task];
                        const hasScreenshot = !!screenshots[task];

                        return (
                            <div key={task} style={{
                                padding: '0.8rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{task}</span>
                                    {isDone && <span style={{ color: '#2ecc71', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={12} /> Done</span>}
                                </div>

                                {!isDone && !isEnded && (
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <label style={{
                                            cursor: 'pointer',
                                            padding: '0.4rem 0.8rem',
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '0.4rem',
                                            fontSize: '0.8rem',
                                            display: 'flex', alignItems: 'center', gap: '0.4rem'
                                        }}>
                                            <Camera size={14} /> {hasScreenshot ? 'Change' : 'Upload Proof'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleScreenshotUpload(task, file);
                                                }}
                                            />
                                        </label>

                                        {hasScreenshot && (
                                            <button
                                                onClick={() => handleSubmitScreenshot(task)}
                                                disabled={uploadingTask === task}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    background: 'var(--accent)',
                                                    border: 'none',
                                                    borderRadius: '0.4rem',
                                                    color: 'white',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '0.4rem'
                                                }}
                                            >
                                                {uploadingTask === task ? <Loader2 size={14} className="spin" /> : <><CheckCircle size={14} /> Submit</>}
                                            </button>
                                        )}
                                    </div>
                                )}
                                {hasScreenshot && !isDone && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <img src={screenshots[task]} alt="Preview" style={{ height: '40px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {isUserAdmin && (
                    <Link
                        href={`/campaigns/${campaign.id}/submissions`}
                        style={{
                            fontSize: '0.8rem',
                            color: 'var(--muted-foreground)',
                            textDecoration: 'underline',
                            marginTop: '0.5rem'
                        }}
                    >
                        View Submissions (Admin)
                    </Link>
                )}
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
