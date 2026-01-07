'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { MockService } from '@/lib/mockService';
import { ReputationBadge, ScoreBreakdown } from '@/components/ReputationBadge';
import { CheckCircle } from 'lucide-react';

export default function ClaimPage() {
    const params = useParams();
    const router = useRouter();
    const { address } = useAccount();
    const campaignId = params.campaignId as string;

    const [claimData, setClaimData] = useState<any>(null);
    const [claiming, setClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!address) return;

        MockService.getClaimable(campaignId, address).then(data => {
            setClaimData(data);
            setLoading(false);
        });
    }, [campaignId, address]);

    const handleClaim = async () => {
        if (!address) return;

        setClaiming(true);
        try {
            const result = await MockService.claimReward(campaignId, address);
            if (result.success) {
                setClaimed(true);
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setClaiming(false);
        }
    };

    if (!address) {
        return (
            <main className="container" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
                    <h2>Connect Wallet</h2>
                    <p style={{ color: 'var(--muted-foreground)', marginTop: '1rem' }}>
                        Please connect your wallet to claim rewards
                    </p>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="container flex-center" style={{ minHeight: '80vh' }}>
                <div>Loading...</div>
            </main>
        );
    }

    if (!claimData) {
        return (
            <main className="container" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
                    <h2>No Rewards Available</h2>
                    <p style={{ color: 'var(--muted-foreground)', marginTop: '1rem' }}>
                        You don't have any claimable rewards for this campaign.
                    </p>
                    <button
                        onClick={() => router.push('/tasks')}
                        className="glass-button"
                        style={{ marginTop: '2rem', padding: '0.75rem 1.5rem' }}
                    >
                        Browse Tasks
                    </button>
                </div>
            </main>
        );
    }

    if (claimed) {
        return (
            <main className="container" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
                    <CheckCircle size={64} style={{ color: '#2ecc71', margin: '0 auto 1.5rem' }} />
                    <h2>Reward Claimed!</h2>
                    <p style={{ fontSize: '2rem', fontWeight: 700, margin: '1rem 0', fontFamily: 'var(--font-space)' }}>
                        ${claimData.amount.toFixed(6)}
                    </p>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        Your reward has been sent to your wallet
                    </p>
                    <button
                        onClick={() => router.push('/profile')}
                        className="glass-button"
                        style={{ marginTop: '2rem', padding: '0.75rem 1.5rem' }}
                    >
                        View Profile
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="container" style={{ padding: '2rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                Claim Your Reward
            </h1>

            {/* Reward Amount */}
            <div className="glass-panel" style={{
                padding: '2rem',
                textAlign: 'center',
                background: 'linear-gradient(145deg, rgba(123,63,228,0.1) 0%, rgba(255,255,255,0.02) 100%)',
                marginBottom: '1.5rem'
            }}>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Your Reward
                </div>
                <div style={{
                    fontSize: '3rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-space)',
                    color: 'var(--primary-light)',
                    lineHeight: 1
                }}>
                    ${claimData.amount.toFixed(6)}
                </div>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Based on your quality score
                </div>
            </div>

            {/* Quality Score */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <ReputationBadge qualityScore={claimData.qualityScore} showBonus />
            </div>

            <ScoreBreakdown qualityScore={claimData.qualityScore} />

            {/* Claim Button */}
            <button
                onClick={handleClaim}
                disabled={claiming}
                className="glass-button"
                style={{
                    width: '100%',
                    padding: '1.25rem',
                    marginTop: '2rem',
                    background: 'var(--primary)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    borderRadius: '12px',
                }}
            >
                {claiming ? 'Claiming...' : 'Claim Reward'}
            </button>

            <p style={{
                textAlign: 'center',
                fontSize: '0.8rem',
                color: 'var(--muted-foreground)',
                marginTop: '1rem'
            }}>
                This will send the reward to your connected wallet
            </p>
        </main>
    );
}
