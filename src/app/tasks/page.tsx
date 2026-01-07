'use client';

import { useCampaigns } from '@/hooks/useCampaigns';
import { CampaignCard } from '@/components/CampaignCard';
import Link from 'next/link';

export default function TasksPage() {
    const { data: campaigns, isLoading } = useCampaigns();

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '2rem' }}>Earn Crypto</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Complete social tasks to get paid instantly.</p>
            </header>

            {isLoading ? (
                <div className="flex-center" style={{ minHeight: '200px' }}>Loading...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {campaigns?.map(c => (
                        <Link key={c.id} href={`/tasks/${c.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                            <CampaignCard campaign={c} />
                        </Link>
                    ))}
                    {(!campaigns || campaigns.length === 0) && (
                        <div style={{
                            gridColumn: '1/-1',
                            textAlign: 'center',
                            padding: '4rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            color: 'var(--muted-foreground)'
                        }}>
                            <h3 style={{ fontSize: '1.2rem', color: 'white' }}>No tasks available right now.</h3>
                            <p>Check back later for new earning opportunities.</p>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
