'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useQuery } from '@tanstack/react-query';
import { MockService } from '@/lib/mockService';
import { User, CheckCircle, TrendingUp, History } from 'lucide-react';

export default function ProfilePage() {
    const { address, isConnected } = useAccount();

    const { data: stats } = useQuery({
        queryKey: ['userStats', address],
        queryFn: () => MockService.getUserStats(address || ''),
        enabled: !!address
    });

    if (!isConnected) {
        return (
            <main className="container flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '2rem' }}>
                <h1 className="gradient-text">Profile</h1>
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--muted-foreground)' }}>Connect wallet to view your task history and earnings.</p>
                    <div className="flex-center">
                        <ConnectButton />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 className="gradient-text" style={{ fontSize: '2rem' }}>My Profile</h1>
                <span style={{
                    padding: '0.4rem 0.8rem',
                    background: 'rgba(123, 63, 228, 0.2)',
                    border: '1px solid var(--primary)',
                    borderRadius: '99px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--primary-light)'
                }}>PRO USER</span>
            </header>

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
                    {stats?.history.map((item, i) => (
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
                    ))}
                </div>
            </section>
        </main>
    );
}
