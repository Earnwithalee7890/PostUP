'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SupabaseService } from '@/lib/supabaseService';
import { Trophy, Wallet, Star, Target, Users } from 'lucide-react';

export default function LeaderboardPage() {
    const [tab, setTab] = useState<'earners' | 'spenders'>('earners');

    const { data: earners, isLoading: loadingEarners } = useQuery({
        queryKey: ['leaderboard', 'earners'],
        queryFn: () => SupabaseService.getTopEarners(),
    });

    const { data: spenders, isLoading: loadingSpenders } = useQuery({
        queryKey: ['leaderboard', 'spenders'],
        queryFn: () => SupabaseService.getTopSpenders(),
    });

    const list = tab === 'earners' ? earners : spenders;
    const isLoading = tab === 'earners' ? loadingEarners : loadingSpenders;

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Leaderboard</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Top earners and biggest campaign creators</p>
            </header>

            {/* TABS */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <button
                    onClick={() => setTab('earners')}
                    style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '99px',
                        background: tab === 'earners' ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' : 'rgba(255,255,255,0.05)',
                        border: tab === 'earners' ? 'none' : '1px solid var(--border)',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Wallet size={16} /> Top Earners
                </button>
                <button
                    onClick={() => setTab('spenders')}
                    style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '99px',
                        background: tab === 'spenders' ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' : 'rgba(255,255,255,0.05)',
                        border: tab === 'spenders' ? 'none' : '1px solid var(--border)',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Star size={16} /> Top Spenders
                </button>
            </div>

            {/* LIST */}
            <div className="glass-panel" style={{ padding: '0', minHeight: '200px' }}>
                {isLoading ? (
                    <div className="flex-center" style={{ height: '200px', color: 'var(--muted-foreground)' }}>Loading...</div>
                ) : !list || list.length === 0 ? (
                    <div className="flex-center" style={{ height: '200px', flexDirection: 'column', gap: '1rem', color: 'var(--muted-foreground)' }}>
                        <Trophy size={32} style={{ opacity: 0.2 }} />
                        <p>No activity recorded yet.</p>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Be the first to climb the ranks!</span>
                    </div>
                ) : (
                    list.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid var(--border)',
                            background: i < 3 ? `rgba(${i === 0 ? '255,215,0' : i === 1 ? '192,192,192' : '205,127,50'}, 0.05)` : 'transparent'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{
                                    fontFamily: 'var(--font-space)',
                                    fontWeight: 700,
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: i === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffb347 100%)'
                                        : i === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)'
                                            : i === 2 ? 'linear-gradient(135deg, #cd7f32 0%, #b87333 100%)'
                                                : 'rgba(255,255,255,0.1)',
                                    color: i < 3 ? '#000' : 'var(--muted-foreground)',
                                    fontSize: '0.9rem'
                                }}>
                                    {item.rank}
                                </span>

                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Users size={14} color="var(--primary)" />
                                        {tab === 'earners' ? `FID ${item.fid}` : 'Creator'}
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--muted-foreground)',
                                        fontFamily: 'monospace',
                                        maxWidth: '180px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {item.address ? `${item.address.slice(0, 10)}...${item.address.slice(-6)}` : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontWeight: 700,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1.1rem'
                                }}>
                                    {tab === 'earners' ? (
                                        <>
                                            <Target size={18} color="#8b5cf6" />
                                            {item.value} campaigns
                                        </>
                                    ) : (
                                        <>
                                            <Star size={18} color="#f59e0b" />
                                            ${item.value.toLocaleString()}
                                        </>
                                    )}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                    {tab === 'earners' ? 'Campaigns Joined' : `${item.campaigns} campaigns created`}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
