'use client';

import { useState } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { MockService } from '@/lib/mockService';
import { getDistributionStats } from '@/lib/distribution';
import { Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    const { data: campaigns } = useCampaigns(true);
    const [selectedCampaign, setSelectedCampaign] = useState<string>('');
    const [simulating, setSimulating] = useState(false);
    const [ending, setEnding] = useState(false);
    const [stats, setStats] = useState<any>(null);

    const handleSimulate = async () => {
        if (!selectedCampaign || !campaigns) return;
        const campaignObj = campaigns.find(c => c.id === selectedCampaign);
        if (campaignObj) MockService.ensureCampaign(campaignObj);

        setSimulating(true);
        try {
            const campaign = await MockService.simulateCampaign(selectedCampaign, 150);
            alert(`Simulated 150 participants joining campaign!`);
            window.location.reload();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSimulating(false);
        }
    };

    const handleEnd = async () => {
        if (!selectedCampaign || !campaigns) return;
        const campaignObj = campaigns.find(c => c.id === selectedCampaign);
        if (campaignObj) MockService.ensureCampaign(campaignObj);

        setEnding(true);
        try {
            const result = await MockService.endCampaign(selectedCampaign);
            const campaign = await MockService.getCampaign(selectedCampaign);

            if (campaign) {
                const distributionStats = getDistributionStats({
                    totalWeight: result.distribution.totalWeight,
                    netBudget: result.distribution.netBudget,
                    claims: result.distribution.claims,
                });
                setStats(distributionStats);
            }

            alert(`Campaign ended! Merkle root: ${result.merkleRoot.slice(0, 20)}...`);
            window.location.reload();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setEnding(false);
        }
    };

    return (
        <main className="container">
            <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                Creator Dashboard
            </h1>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Simulate Campaign Flow</h3>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
                        Select Campaign
                    </label>
                    <select
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'white',
                        }}
                    >
                        <option value="">Choose a campaign...</option>
                        {campaigns?.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.id} - {c.category} ({c.status})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleSimulate}
                        disabled={!selectedCampaign || simulating}
                        className="glass-button"
                        style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white' }}
                    >
                        {simulating ? 'Simulating...' : '1. Simulate 150 Users Join'}
                    </button>

                    <button
                        onClick={handleEnd}
                        disabled={!selectedCampaign || ending}
                        className="glass-button"
                        style={{ padding: '0.75rem 1.5rem', background: 'var(--secondary)', color: 'white' }}
                    >
                        {ending ? 'Ending...' : '2. End Campaign & Calculate'}
                    </button>
                </div>

                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                    This simulates the full flow: users join → campaign ends → rewards calculated → users can claim
                </p>
            </div>

            {stats && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Distribution Stats</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Users size={18} color="var(--muted-foreground)" />
                                <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Total Participants</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.participants}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                Low Tier ({stats.distribution.low.count})
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#9ca3af' }}>
                                ${stats.distribution.low.avgReward.toFixed(3)} avg
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                Mid Tier ({stats.distribution.mid.count})
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#60a5fa' }}>
                                ${stats.distribution.mid.avgReward.toFixed(3)} avg
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                High Tier ({stats.distribution.high.count})
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#a78bfa' }}>
                                ${stats.distribution.high.avgReward.toFixed(3)} avg
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                            Payout Multiplier
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>
                            High earns <strong style={{ color: 'var(--primary-light)' }}>
                                {(stats.distribution.high.avgReward / stats.distribution.low.avgReward).toFixed(1)}×
                            </strong> more than Low tier
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Your Active & Ended Campaigns</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {campaigns?.map(c => (
                        <div key={c.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{c.category} Campaign</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                                        ID: <code style={{ color: 'var(--primary-light)' }}>{c.id}</code> | {c.platform}
                                    </div>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                                        <span><strong>{c.participantCount || 0}</strong> Joined</span>
                                        <span><strong>${c.totalBudget}</strong> Budget</span>
                                        <span style={{
                                            color: c.status === 'active' ? '#2ecc71' : '#f59e0b',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            fontSize: '0.75rem'
                                        }}>{c.status}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link
                                        href={`/campaigns/${c.id}/submissions`}
                                        className="glass-button"
                                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', background: 'var(--primary)', color: 'white', border: 'none' }}
                                    >
                                        Review Submissions
                                    </Link>
                                    {c.status === 'claimable' && (
                                        <Link
                                            href={`/claim/${c.id}`}
                                            className="glass-button"
                                            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                                        >
                                            View Claims
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
