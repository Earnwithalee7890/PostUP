'use client';

import { useQuery } from '@tanstack/react-query';
import { MockService } from '@/lib/mockService';
import { NeynarService } from '@/lib/neynar';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { useAllUserSubmissions } from '@/hooks/useCampaigns';
import { User, CheckCircle, History, Copy, Plus, Bell, Clock, XCircle } from 'lucide-react';
import sdk from '@farcaster/miniapp-sdk';
import { useState } from 'react';

export default function ProfilePage() {
    const { context } = useFarcasterContext();
    const [addingApp, setAddingApp] = useState(false);

    const { data: stats } = useQuery({
        queryKey: ['userStats', context?.user?.fid],
        queryFn: async () => {
            if (context?.user?.fid) {
                return NeynarService.getUserStats(context.user.fid);
            }
            return MockService.getUserStats('');
        },
        enabled: !!context?.user?.fid
    });

    // Fetch real submissions from Supabase for Task History
    const { data: userSubmissions, isLoading: submissionsLoading } = useAllUserSubmissions(context?.user?.fid);

    // Determine identity from Farcaster
    const identityAddress = context?.user?.verifications?.[0] || stats?.verifications?.[0];
    const identityName = context?.user?.displayName || 'Guest User';
    const identityUsername = context?.user?.username || 'guest';
    const identityPfp = context?.user?.pfpUrl;

    const displayAddress = identityAddress || '';

    const copyAddress = () => {
        if (displayAddress) {
            navigator.clipboard.writeText(displayAddress);
            alert('Address copied!');
        }
    };

    const handleAddMiniApp = async () => {
        try {
            setAddingApp(true);
            await sdk.actions.addFrame();
            alert('Mini App added! You can now receive notifications.');
        } catch (error) {
            console.error('Failed to add mini app:', error);
        } finally {
            setAddingApp(false);
        }
    };

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            {/* PROFILE HEADER CARD */}
            <div className="glass-panel" style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* AVATAR */}
                    <div style={{
                        width: '64px', height: '64px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {identityPfp ? (
                            <img src={identityPfp} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={32} color="#fff" />
                        )}
                    </div>

                    {/* USER DETAILS */}
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                            {identityName}
                        </h2>
                        <div style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            @{identityUsername}
                            {displayAddress && (
                                <span style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    cursor: 'pointer'
                                }} onClick={copyAddress}>
                                    {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
                                    <Copy size={10} />
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Mini App Button */}
                <button
                    onClick={handleAddMiniApp}
                    disabled={addingApp}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(139, 92, 246, 0.5)',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
                        color: '#8b5cf6',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: addingApp ? 'wait' : 'pointer'
                    }}
                >
                    <Bell size={16} />
                    {addingApp ? 'Adding...' : 'Enable Notifications'}
                </button>
            </div>

            {/* STATS GRID - HORIZONTAL COMPACT */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
                <div className="glass-panel" style={{ padding: '0.75rem 1rem', textAlign: 'center', flex: '0 0 auto', minWidth: '90px' }}>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Tasks</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{stats?.totalTasks || 0}</div>
                </div>
                <div className="glass-panel" style={{ padding: '0.75rem 1rem', textAlign: 'center', flex: '0 0 auto', minWidth: '90px' }}>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Score</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a5a6f6' }}>{stats?.neynarScore || 0}%</div>
                </div>
                <div className="glass-panel" style={{ padding: '0.75rem 1rem', textAlign: 'center', flex: '0 0 auto', minWidth: '90px' }}>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Followers</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{stats?.followers || 0}</div>
                </div>
                <div className="glass-panel" style={{ padding: '0.75rem 1rem', textAlign: 'center', flex: '0 0 auto', minWidth: '90px' }}>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem', marginBottom: '0.25rem' }}>Status</div>
                    <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: stats?.isSpam ? '#ef4444' : '#2ecc71',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                    }}>
                        {stats?.isSpam ? '⚠️ Spammy' : '✓ Safe'}
                    </div>
                </div>
            </div>

            {/* ABOUT BUTTON */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <button
                    onClick={() => (document.getElementById('about-modal') as HTMLDialogElement)?.showModal()}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--muted-foreground)',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                    }}
                >
                    About Platform
                </button>
            </div>

            <dialog id="about-modal" style={{
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--foreground)',
                maxWidth: '400px',
                width: '90%'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>About Tip2Post</h3>
                    <form method="dialog">
                        <button style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>✕</button>
                    </form>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    <div>
                        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--foreground)' }}>How it Works</h4>
                        <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
                            Tip2Post helps you grow onchain. Create tasks and reward real users for engagement.
                        </p>
                    </div>
                    <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>Platform Fee</span>
                            <span style={{ color: 'var(--primary)' }}>10%</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                            We charge a 10% service fee upfront. 90% goes to users.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--foreground)' }}>Fair Distribution</h4>
                        <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
                            Rewards based on <strong>Quality Score</strong>. High-quality users earn more.
                        </p>
                    </div>
                </div>
            </dialog>

            {/* HISTORY - Real data from Supabase, grouped by campaign */}
            <section>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <History size={18} /> Task History
                </h3>

                <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                    {submissionsLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            Loading your tasks...
                        </div>
                    ) : userSubmissions && userSubmissions.length > 0 ? (
                        // Group submissions by campaignId
                        (() => {
                            const grouped = userSubmissions.reduce((acc: any, item: any) => {
                                if (!acc[item.campaignId]) {
                                    acc[item.campaignId] = {
                                        campaignId: item.campaignId,
                                        platform: item.platform,
                                        category: item.category,
                                        rewardToken: item.rewardToken,
                                        createdAt: item.createdAt,
                                        tasks: [],
                                        statuses: []
                                    };
                                }
                                acc[item.campaignId].tasks.push(item.taskId);
                                acc[item.campaignId].statuses.push(item.status);
                                return acc;
                            }, {});

                            const campaigns = Object.values(grouped) as any[];

                            return campaigns.map((campaign: any, i: number) => {
                                // Determine overall status: all approved = approved, any rejected = rejected, else pending
                                const hasRejected = campaign.statuses.includes('rejected');
                                const allApproved = campaign.statuses.every((s: string) => s === 'approved');
                                const overallStatus = hasRejected ? 'rejected' : allApproved ? 'approved' : 'pending';

                                return (
                                    <div key={campaign.campaignId || i} style={{
                                        padding: '1.25rem',
                                        borderBottom: '1px solid var(--border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '180px' }}>
                                            <div style={{
                                                width: '36px', height: '36px',
                                                borderRadius: '8px',
                                                background: overallStatus === 'approved'
                                                    ? 'rgba(46, 204, 113, 0.15)'
                                                    : overallStatus === 'rejected'
                                                        ? 'rgba(239, 68, 68, 0.15)'
                                                        : 'rgba(245, 158, 11, 0.15)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {overallStatus === 'approved' ? (
                                                    <CheckCircle size={18} color="#2ecc71" />
                                                ) : overallStatus === 'rejected' ? (
                                                    <XCircle size={18} color="#ef4444" />
                                                ) : (
                                                    <Clock size={18} color="#f59e0b" />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                                    {campaign.category} Campaign
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                                    {campaign.tasks.join(' + ')} • {campaign.platform} • {new Date(campaign.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge Only - No individual amounts */}
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '4px',
                                            fontWeight: 600,
                                            background: overallStatus === 'approved'
                                                ? 'rgba(46, 204, 113, 0.2)'
                                                : overallStatus === 'rejected'
                                                    ? 'rgba(239, 68, 68, 0.2)'
                                                    : 'rgba(245, 158, 11, 0.2)',
                                            color: overallStatus === 'approved'
                                                ? '#2ecc71'
                                                : overallStatus === 'rejected'
                                                    ? '#ef4444'
                                                    : '#f59e0b',
                                            border: `1px solid ${overallStatus === 'approved'
                                                ? 'rgba(46, 204, 113, 0.4)'
                                                : overallStatus === 'rejected'
                                                    ? 'rgba(239, 68, 68, 0.4)'
                                                    : 'rgba(245, 158, 11, 0.4)'}`
                                        }}>
                                            {overallStatus === 'approved' ? 'APPROVED' : overallStatus === 'rejected' ? 'REJECTED' : 'PENDING'}
                                        </span>
                                    </div>
                                );
                            });
                        })()
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            No campaigns joined yet. Browse campaigns to get started!
                        </div>
                    )}
                </div>
            </section>
        </main >
    );
}
