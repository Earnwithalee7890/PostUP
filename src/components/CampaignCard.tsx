import { Campaign } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './CampaignCard.module.css';
import { ExternalLink, Image, Camera, Check, Loader2, CheckCircle } from 'lucide-react';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { useAccount } from 'wagmi';
import { isAdmin } from '@/lib/admin';
import { useSubmitScreenshot, useUserSubmissions, useFinalizeCampaign } from '@/hooks/useCampaigns';
import { SupabaseService } from '@/lib/supabaseService';
import sdk from '@farcaster/miniapp-sdk';
import { SuccessModal } from './SuccessModal';
import { useWriteContract, useConfig } from 'wagmi';
import { DISTRIBUTOR_ABI } from '@/lib/abi';
import { DISTRIBUTOR_ADDRESS } from '@/lib/config';
import { generateMerkleDistribution } from '@/lib/merkle';
import { calculateWeightedDistribution, getDistributionStats } from '@/lib/distribution';
import { calculateQualityScore } from '@/lib/qualityScore';
import { NeynarService } from '@/lib/neynar';
import { parseUnits, formatUnits } from 'viem';

export function CampaignCard({ campaign }: { campaign: Campaign }) {
    const { context } = useFarcasterContext();
    const { address } = useAccount();
    const isCreator = campaign.creator === context?.user?.fid?.toString();
    const isUserAdmin = isAdmin(address, context?.user?.fid) || isCreator;
    const { mutateAsync: submitScreenshot } = useSubmitScreenshot();

    const userFid = context?.user?.fid;

    // Fetch this user's submissions for this campaign from Supabase
    const { data: userSubmissions } = useUserSubmissions(campaign.id, userFid);

    const [screenshots, setScreenshots] = useState<Record<string, string>>({});
    const [uploadingTask, setUploadingTask] = useState<string | null>(null);
    const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Load completion state from Supabase submissions
    useEffect(() => {
        if (!userSubmissions || userSubmissions.length === 0) return;

        const restored: Record<string, boolean> = {};
        const restoredScreenshots: Record<string, string> = {};

        userSubmissions.forEach((sub: any) => {
            restored[sub.task_id] = true;
            if (sub.screenshot_url) {
                restoredScreenshots[sub.task_id] = sub.screenshot_url;
            }
        });

        setCompletedTasks(restored);
        setScreenshots(restoredScreenshots);
    }, [userSubmissions]);

    const { writeContractAsync: writeClaim } = useWriteContract();
    const [isClaiming, setIsClaiming] = useState(false);

    const handleClaim = async () => {
        if (!address) {
            alert('Please connect your wallet to claim rewards');
            return;
        }

        setIsClaiming(true);
        try {
            // 1. Fetch all approved submissions to re-calculate proof
            const allSubs = await SupabaseService.getSubmissions(campaign.id);
            const approvedSubs = allSubs.filter((s: any) => s.status === 'approved');

            // Group by user
            const subsByUser: Record<number, any> = {};
            approvedSubs.forEach((s: any) => {
                if (!subsByUser[s.user_fid]) subsByUser[s.user_fid] = [];
                subsByUser[s.user_fid].push(s);
            });

            const userFids = Object.keys(subsByUser).map(Number);

            // 2. Fetch metadata for all these users in bulk
            const metadata = await NeynarService.getUsersBulk(userFids);

            // 3. Construct participants list
            const participants = userFids.map(fid => {
                const sub = subsByUser[fid][0];
                return {
                    address: sub.user_address,
                    fid,
                    qualityScore: calculateQualityScore({
                        fid,
                        accountAge: 365,
                        followerCount: metadata[fid]?.followerCount || 100,
                        isVerified: true,
                        hasEthActivity: true,
                        completedTasks: 5,
                        hasSpamFlags: false
                    })
                };
            });

            // 4. Calculate Distribution & Proof
            const distribution = calculateWeightedDistribution(participants, campaign.netBudget, 0);
            const { claims } = generateMerkleDistribution(distribution.claims);

            // 5. Find current user's claim
            const userClaim = claims.find(c => c.userAddress.toLowerCase() === address.toLowerCase());

            if (!userClaim) {
                alert('No rewards found for this wallet. Make sure your submissions were approved and you are using the correct wallet!');
                return;
            }

            // 6. Call Contract
            const amountInUSDCUnits = parseUnits(userClaim.amount.toFixed(6), 6);

            const hash = await writeClaim({
                address: DISTRIBUTOR_ADDRESS as `0x${string}`,
                abi: DISTRIBUTOR_ABI,
                functionName: 'claim',
                args: [BigInt(Math.round(Number(campaign.id))), amountInUSDCUnits, userClaim.proof as `0x${string}`[]],
            });

            alert(`Claim transaction submitted! Hash: ${hash}`);
        } catch (error: any) {
            console.error('Claim error:', error);
            alert(`Claim failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsClaiming(false);
        }
    };

    const isFarcasterConnected = !!context?.user;
    const isX = campaign.platform === 'X';
    const isEnded = campaign.status === 'completed' || campaign.status === 'claimable' || campaign.remainingBudget < campaign.rewardAmountPerTask;

    const hasApprovedSubmission = userSubmissions?.some((s: any) => s.status === 'approved');

    // Check if user has completed ALL tasks in this campaign
    const completedTaskCount = Object.keys(completedTasks).filter(k => completedTasks[k]).length;
    const hasCompletedAllTasks = completedTaskCount >= campaign.tasks.length && campaign.tasks.length > 0;
    const progress = ((campaign.totalBudget - campaign.remainingBudget) / campaign.totalBudget) * 100;

    // Use castUrl as fallback when postUrl is empty
    const campaignUrl = campaign.postUrl || campaign.castUrl || '';
    const isFollowTask = campaign.tasks.includes('Follow');

    const handleOpenLink = () => {
        if (campaignUrl) {
            sdk.actions.openUrl(campaignUrl);
        }
    };

    const handleShare = async () => {
        try {
            await sdk.actions.composeCast({
                text: `Check out this campaign on Tip2Post! 🚀`,
                embeds: ['https://post-up-zeta.vercel.app']
            });
        } catch (e) {
            console.log('Share not available');
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
            setShowSuccess(true);
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploadingTask(null);
        }
    };

    // Determine budget tier
    const getBudgetTier = (budget: number) => {
        if (budget >= 30) return 'gold';
        if (budget >= 20) return 'silver';
        return 'bronze';
    };
    const tier = getBudgetTier(campaign.totalBudget);
    const tierClass = tier === 'gold' ? styles.tierGold : tier === 'silver' ? styles.tierSilver : styles.tierBronze;
    const tierLabelClass = tier === 'gold' ? styles.tierLabelGold : tier === 'silver' ? styles.tierLabelSilver : styles.tierLabelBronze;
    const rewardClass = tier === 'gold' ? styles.rewardGold : tier === 'silver' ? styles.rewardSilver : styles.rewardBronze;
    const tierLabel = tier === 'gold' ? '💎 PREMIUM' : tier === 'silver' ? '⭐ STANDARD' : '🥉 STARTER';

    return (
        <div className={`${styles.card} ${tierClass}`}>
            <div className={styles.header}>
                <div className="flex-center" style={{ gap: '0.5rem' }}>
                    <span className={`${styles.platformBadge} ${isX ? styles.platform_X : styles.platform_Farcaster}`}>
                        {campaign.platform}
                    </span>
                    <span className={`${styles.tierLabel} ${tierLabelClass}`}>{tierLabel}</span>
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
                <span className={`${styles.reward} ${rewardClass}`}>
                    ${campaign.totalBudget.toFixed(0)}
                </span>
            </div>

            <div className={styles.content} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>

                {/* Participant Count */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--muted-foreground)'
                }}>
                    <span>👥</span>
                    <span><strong style={{ color: 'white' }}>{campaign.participantCount || 0}</strong> participants joined</span>
                </div>

                {/* Action Buttons Row - Smart buttons based on task type */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Follow Button - if campaign has Follow task */}
                    {campaign.tasks.includes('Follow') && campaignUrl && (
                        <button
                            onClick={handleOpenLink}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1.2rem',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                color: 'white',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            👤 Follow <ExternalLink size={12} />
                        </button>
                    )}

                    {/* Cast Actions Button - if campaign has Like, Repost, Comment */}
                    {(campaign.tasks.includes('Like') || campaign.tasks.includes('Repost') || campaign.tasks.includes('Comment')) && campaignUrl && (
                        <button
                            onClick={handleOpenLink}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1.2rem',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                                color: 'white',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            🔥 Open Cast <ExternalLink size={12} />
                        </button>
                    )}

                    {/* Mini App Button - if campaign category is MiniApp */}
                    {campaign.category === 'MiniApp' && campaignUrl && (
                        <button
                            onClick={handleOpenLink}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1.2rem',
                                background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                                color: 'white',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            🎮 Open Mini App <ExternalLink size={12} />
                        </button>
                    )}

                    {/* Claim Button - if status is claimable */}
                    {campaign.status === 'claimable' && hasApprovedSubmission && (
                        <button
                            onClick={handleClaim}
                            disabled={isClaiming}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1.2rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                borderRadius: '0.5rem',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                opacity: isClaiming ? 0.7 : 1
                            }}
                        >
                            {isClaiming ? <Loader2 className="spin" size={16} /> : <span>💰 Claim Reward</span>}
                        </button>
                    )}

                    {/* Fallback if no recognized task type but has URL */}
                    {!campaign.tasks.includes('Follow') &&
                        !campaign.tasks.includes('Like') &&
                        !campaign.tasks.includes('Repost') &&
                        !campaign.tasks.includes('Comment') &&
                        campaign.category !== 'MiniApp' &&
                        campaign.status !== 'claimable' &&
                        campaignUrl && (
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
                                    fontSize: '0.85rem',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Open Link <ExternalLink size={12} />
                            </button>
                        )}

                    {/* No URL message */}
                    {!campaignUrl && (
                        <span style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>No URL provided</span>
                    )}

                    {/* Share Button */}
                    <button
                        onClick={handleShare}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1rem',
                            background: 'rgba(139, 92, 246, 0.2)',
                            color: 'var(--primary)',
                            borderRadius: '0.5rem',
                            fontWeight: 500,
                            fontSize: '0.85rem',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            cursor: 'pointer'
                        }}
                    >
                        📤 Share
                    </button>
                </div>

                {/* Inline Tasks & Submission - Hide for users who completed all tasks (unless admin) */}
                {hasCompletedAllTasks && !isUserAdmin ? (
                    // User completed all tasks - show joined message
                    <div style={{
                        width: '100%',
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.1) 100%)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(46, 204, 113, 0.3)',
                        marginTop: '0.5rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                        }}>
                            <CheckCircle size={20} style={{ color: '#2ecc71' }} />
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#2ecc71' }}>
                                You&apos;ve Joined This Campaign!
                            </span>
                        </div>
                        <p style={{
                            fontSize: '0.85rem',
                            color: 'var(--muted-foreground)',
                            margin: 0,
                            lineHeight: 1.4
                        }}>
                            Your proof has been submitted. Status: <span style={{
                                color: '#f59e0b',
                                fontWeight: 500
                            }}>Pending Review</span>
                        </p>
                    </div>
                ) : (
                    // Show grouped tasks for admin OR users who haven't completed all tasks
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                        {/* Group 1: Follow Task (if exists) - needs separate screenshot */}
                        {campaign.tasks.includes('Follow') && (() => {
                            const followDone = completedTasks['Follow'];
                            const followScreenshot = screenshots['Follow'];

                            return (
                                <div style={{
                                    padding: '0.8rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>📷 Follow Proof</span>
                                        {followDone && <span style={{ color: '#2ecc71', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={12} /> Done</span>}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: '0 0 0.5rem 0' }}>
                                        Screenshot showing you followed the account
                                    </p>

                                    {!followDone && !isEnded && (
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <label style={{
                                                cursor: 'pointer',
                                                padding: '0.4rem 0.8rem',
                                                background: 'rgba(255,255,255,0.1)',
                                                borderRadius: '0.4rem',
                                                fontSize: '0.8rem',
                                                display: 'flex', alignItems: 'center', gap: '0.4rem'
                                            }}>
                                                <Camera size={14} /> {followScreenshot ? 'Change' : 'Upload Proof'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleScreenshotUpload('Follow', file);
                                                    }}
                                                />
                                            </label>

                                            {followScreenshot && (
                                                <button
                                                    onClick={() => handleSubmitScreenshot('Follow')}
                                                    disabled={uploadingTask === 'Follow'}
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
                                                    {uploadingTask === 'Follow' ? <Loader2 size={14} className="spin" /> : <><CheckCircle size={14} /> Submit</>}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {followScreenshot && !followDone && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <img src={followScreenshot} alt="Preview" style={{ height: '40px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Group 2: Cast Actions (Like, Repost, Comment) - ONE screenshot for all */}
                        {(() => {
                            const castActions = campaign.tasks.filter(t => ['Like', 'Repost', 'Comment'].includes(t));
                            if (castActions.length === 0) return null;

                            // Check if ALL cast actions are done (we mark all with one screenshot)
                            const allCastDone = castActions.every(t => completedTasks[t]);
                            const castScreenshot = screenshots['CastActions'] || screenshots[castActions[0]];

                            const handleCastUpload = (file: File) => {
                                // Upload once, apply to all cast actions
                                handleScreenshotUpload('CastActions', file);
                            };

                            const handleCastSubmit = async () => {
                                const screenshot = screenshots['CastActions'];
                                if (!screenshot) return;

                                setUploadingTask('CastActions');
                                try {
                                    // Submit for all cast actions at once
                                    for (const task of castActions) {
                                        await submitScreenshot({
                                            campaignId: campaign.id,
                                            taskId: task,
                                            screenshot: screenshot,
                                            userFid: context?.user?.fid!,
                                            address: address || '0x0000000000000000000000000000000000000000'
                                        });
                                        setCompletedTasks(prev => ({ ...prev, [task]: true }));
                                    }
                                    setShowSuccess(true);
                                } catch (error) {
                                    console.error('Upload error:', error);
                                } finally {
                                    setUploadingTask(null);
                                }
                            };

                            return (
                                <div style={{
                                    padding: '0.8rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>📷 Cast Proof</span>
                                        {allCastDone && <span style={{ color: '#2ecc71', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={12} /> Done</span>}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: '0 0 0.5rem 0' }}>
                                        One screenshot showing: {castActions.join(' + ')}
                                    </p>

                                    {!allCastDone && !isEnded && (
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <label style={{
                                                cursor: 'pointer',
                                                padding: '0.4rem 0.8rem',
                                                background: 'rgba(255,255,255,0.1)',
                                                borderRadius: '0.4rem',
                                                fontSize: '0.8rem',
                                                display: 'flex', alignItems: 'center', gap: '0.4rem'
                                            }}>
                                                <Camera size={14} /> {castScreenshot ? 'Change' : 'Upload Proof'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleCastUpload(file);
                                                    }}
                                                />
                                            </label>

                                            {castScreenshot && (
                                                <button
                                                    onClick={handleCastSubmit}
                                                    disabled={uploadingTask === 'CastActions'}
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
                                                    {uploadingTask === 'CastActions' ? <Loader2 size={14} className="spin" /> : <><CheckCircle size={14} /> Submit All</>}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {castScreenshot && !allCastDone && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <img src={castScreenshot} alt="Preview" style={{ height: '40px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                )}

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

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Proof Submitted!"
                message="Your screenshot has been submitted for review. You'll be notified once it's approved."
            />
        </div >
    );
}
