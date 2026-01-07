'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MockService } from '@/lib/mockService';
import { Trophy, Wallet, Star } from 'lucide-react';

export default function LeaderboardPage() {
    const [tab, setTab] = useState<'earners' | 'creators'>('earners');

    const { data: list, isLoading } = useQuery({
        queryKey: ['leaderboard', tab],
        queryFn: () => MockService.getLeaderboard(tab),
    });

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Leaderboard</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Top contributors and biggest spenders.</p>
            </header>

            {/* TABS */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <button
                    onClick={() => setTab('earners')}
                    className={`glass-button ${tab === 'earners' ? 'active-tab' : ''}`}
                    style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '99px',
                        background: tab === 'earners' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        border: tab === 'earners' ? 'none' : '1px solid var(--border)'
                    }}
                >
                    Top Earners
                </button>
                <button
                    onClick={() => setTab('creators')}
                    className={`glass-button ${tab === 'creators' ? 'active-tab' : ''}`}
                    style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '99px',
                        background: tab === 'creators' ? 'var(--secondary)' : 'rgba(255,255,255,0.05)',
                        border: tab === 'creators' ? 'none' : '1px solid var(--border)'
                    }}
                >
                    Top Creators
                </button>
            </div>

            {/* LIST */}
            <div className="glass-panel" style={{ padding: '0', minHeight: '200px' }}>
                {isLoading ? (
                    <div className="flex-center" style={{ height: '200px', color: 'var(--muted-foreground)' }}>Loading...</div>
                ) : list?.length === 0 ? (
                    <div className="flex-center" style={{ height: '200px', flexDirection: 'column', gap: '1rem', color: 'var(--muted-foreground)' }}>
                        <Trophy size={32} style={{ opacity: 0.2 }} />
                        <p>No activity recorded yet.</p>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Be the first to climb the ranks!</span>
                    </div>
                ) : (
                    list?.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid var(--border)',
                            background: i < 3 ? 'rgba(255,255,255,0.02)' : 'transparent'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{
                                    fontFamily: 'var(--font-space)',
                                    fontWeight: 700,
                                    width: '30px',
                                    color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--muted-foreground)'
                                }}>
                                    #{item.rank}
                                </span>

                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600 }}>User {item.fid}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{item.address}</span>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {tab === 'earners' ? <Wallet size={16} color="var(--primary-light)" /> : <Star size={16} color="var(--secondary)" />}
                                    ${item.value.toLocaleString()}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                    {tab === 'earners' ? 'Total Earned' : 'Total Spend'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
