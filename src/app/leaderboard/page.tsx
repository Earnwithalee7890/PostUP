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
                    list?.map((item, i) => (
                        <div key={i} className="glass-panel" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.25rem',
                            marginBottom: '0.75rem',
                            border: i < 3
                                ? (i === 0 ? '1px solid rgba(255, 215, 0, 0.3)' : i === 1 ? '1px solid rgba(192, 192, 192, 0.3)' : '1px solid rgba(205, 127, 50, 0.3)')
                                : '1px solid rgba(255,255,255,0.05)',
                            background: i < 3
                                ? (i === 0 ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)'
                                    : i === 1 ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(192, 192, 192, 0.05) 100%)'
                                        : 'linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(205, 127, 50, 0.05) 100%)')
                                : 'rgba(255,255,255,0.02)',
                            borderRadius: '1.25rem',
                            transition: 'transform 0.2s ease, background 0.2s ease',
                            cursor: 'default',
                            boxShadow: i < 3 ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : 'none'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <span style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    background: i === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffac00 100%)'
                                        : i === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)'
                                            : i === 2 ? 'linear-gradient(135deg, #cd7f32 0%, #b87333 100%)'
                                                : 'rgba(255,255,255,0.1)',
                                    color: i < 3 ? '#000' : 'var(--muted-foreground)',
                                    fontSize: '0.9rem',
                                    flexShrink: 0
                                }}>
                                    {item.rank}
                                </span>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        {item.pfpUrl ? (
                                            <img src={item.pfpUrl} alt={item.username || 'user'} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                                        ) : (
                                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.1)' }}>
                                                <Users size={24} color="var(--muted-foreground)" />
                                            </div>
                                        )}
                                        {i < 3 && (
                                            <div style={{
                                                position: 'absolute',
                                                top: -5,
                                                right: -5,
                                                background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32',
                                                border: '2px solid #020205',
                                                borderRadius: '50%',
                                                width: '18px',
                                                height: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 2
                                            }}>
                                                <Star size={10} color="#000" fill="#000" />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', letterSpacing: '-0.01em' }}>
                                            {item.displayName || (item.username ? `@${item.username}` : (tab === 'earners' ? `FID ${item.fid}` : (item.fid > 0 ? `FID ${item.fid}` : `Creator ${item.address.slice(0, 6)}`)))}
                                        </span>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--muted-foreground)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem'
                                        }}>
                                            {item.username && <span style={{ color: 'var(--primary)' }}>@{item.username}</span>}
                                            {item.address && <span style={{ opacity: 0.7 }}>• {item.address.slice(0, 6)}...{item.address.slice(-4)}</span>}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontWeight: 800,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: '0.5rem',
                                    fontSize: '1.25rem',
                                    letterSpacing: '-0.02em'
                                }}>
                                    {tab === 'earners' ? (
                                        <>
                                            <Target size={20} color="#8b5cf6" />
                                            {item.value}
                                        </>
                                    ) : (
                                        <>
                                            <Wallet size={20} color="#f59e0b" />
                                            ${item.value.toFixed(2)}
                                        </>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 500, marginTop: '0.2rem' }}>
                                    {tab === 'earners' ? 'campaigns joined' : `${item.campaigns} campaigns created`}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
