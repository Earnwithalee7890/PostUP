'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useQuery } from '@tanstack/react-query';
import { MockService } from '@/lib/mockService';
import { NeynarService } from '@/lib/neynar';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { User, CheckCircle, TrendingUp, History, LogOut, Copy } from 'lucide-react';

export default function ProfilePage() {
    const { address, isConnected } = useAccount();
    const { context, isLoadingContext } = useFarcasterContext();

    const { data: stats } = useQuery({
        queryKey: ['userStats', address, context?.user?.fid],
        queryFn: async () => {
            if (context?.user?.fid) {
                return NeynarService.getUserStats(context.user.fid);
            }
            if (address) {
                return NeynarService.getUserStats(address);
            }
            return MockService.getUserStats('');
        },
        enabled: !!address || !!context?.user?.fid
    });

    if (isLoadingContext) {
        return (
            <main className="container flex-center" style={{ minHeight: '80vh', flexDirection: 'column' }}>
                <div style={{ color: 'var(--muted-foreground)' }}>Loading Farcaster Context...</div>
            </main>
        );
    }

    if (!isConnected && !context?.user) {
        return (
            <main className="container flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '2rem' }}>
                <h1 className="gradient-text">Profile</h1>
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--muted-foreground)' }}>Connect wallet or open in Farcaster to view your task history.</p>
                    <div className="flex-center">
                        <ConnectButton />
                    </div>
                </div>
            </main>
        );
    }

    const { disconnect } = useDisconnect();

    // Auto-detect address: Wallet > Farcaster Verified > Empty
    const displayAddress = address || stats?.verifications?.[0] || '';
    const isWalletConnected = !!address;

    const copyAddress = () => {
        if (displayAddress) {
            navigator.clipboard.writeText(displayAddress);
            alert('Address copied!');
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
                        {context?.user?.pfpUrl ? (
                            <img src={context.user.pfpUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={32} color="#fff" />
                        )}
                    </div>

                    {/* USER DETAILS */}
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                            {context?.user?.displayName || 'Unknown User'}
                        </h2>
                        <div style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            @{context?.user?.username || 'user'}
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
                                    {!isWalletConnected && <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>(Auto)</span>}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {stats?.isPro && (
                        <div style={{
                            padding: '0.4rem 0.8rem',
                            background: 'rgba(123, 63, 228, 0.2)',
                            border: '1px solid var(--primary)',
                            borderRadius: '99px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--primary-light)',
                            height: 'fit-content'
                        }}>PRO</div>
                    )}

                    <button
                        onClick={() => disconnect()}
                        style={{
                            padding: '0.6rem',
                            borderRadius: '50%',
                            background: 'rgba(255, 73, 74, 0.1)',
                            border: '1px solid rgba(255, 73, 74, 0.2)',
                            color: '#FF494A',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* STATS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total Tasks</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-space)' }}>{stats?.totalTasks || 0}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Neynar Score</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-space)', color: '#a5a6f6' }}>{stats?.neynarScore || 0}%</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Followers</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-space)' }}>{stats?.followers || 0}</div>
                </div>
            </div>

            {/* HISTORY */}
            <section>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <History size={18} /> Task History
                </h3>

                <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                    {stats?.history && stats.history.length > 0 ? (
                        stats.history.map((item, i) => (
                            <div key={i} style={{
                                padding: '1.25rem',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '36px', height: '36px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <CheckCircle size={18} color={i === 0 ? '#2ecc71' : 'var(--muted-foreground)'} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.task} on {item.platform}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                            {new Date(item.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                                    +{item.reward}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            No history yet. Start a task!
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
