'use client';

import { useCampaigns } from '@/hooks/useCampaigns';
import { TaskCampaignCard } from '@/components/TaskCampaignCard';
import { Trophy } from 'lucide-react';

export default function TasksPage() {
    const { data: campaigns, isLoading } = useCampaigns();

    return (
        <main className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    Earn Crypto
                </h1>
                <p style={{ color: 'var(--muted-foreground)' }}>
                    Complete tasks and earn rewards. Verify instantly!
                </p>
            </header>

            {isLoading ? (
                <div className="flex-center" style={{ minHeight: '200px' }}>Loading campaigns...</div>
            ) : campaigns && campaigns.length > 0 ? (
                <div>
                    {campaigns.map(campaign => (
                        <TaskCampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            ) : (
                <div className="glass-panel" style={{
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <Trophy size={48} style={{ opacity: 0.3 }} />
                    <div>
                        <h3 style={{ marginBottom: '0.5rem' }}>No active campaigns</h3>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                            Check back soon for new earning opportunities!
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}
