'use client';

import { useCampaigns } from '@/hooks/useCampaigns';
import { CampaignCard } from '@/components/CampaignCard';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function CampaignsPage() {
    const { data: campaigns, isLoading } = useCampaigns();

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="gradient-text" style={{ fontSize: '2rem' }}>All Campaigns</h1>
                <Link href="/campaigns/new" className="glass-button flex-center" style={{ gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: 'white' }}>
                    <Plus size={18} /> New
                </Link>
            </header>

            {isLoading ? (
                <div className="flex-center" style={{ minHeight: '200px' }}>Loading...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {campaigns?.map(c => (
                        <CampaignCard key={c.id} campaign={c} />
                    ))}
                    {/* Empty state */}
                    {(!campaigns || campaigns.length === 0) && (
                        <div style={{
                            gridColumn: '1/-1',
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            background: 'var(--glass-bg)',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                                <Plus size={32} style={{ opacity: 0.5 }} />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.5rem' }}>No campaigns yet</h3>
                                <p style={{ color: 'var(--muted-foreground)', maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                                    Create your first campaign to start growing your audience.
                                </p>
                                <Link href="/campaigns/new" className="glass-button" style={{ display: 'inline-flex', padding: '0.6rem 1.5rem' }}>
                                    Launch Campaign
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
