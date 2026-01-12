'use client';

import styles from './page.module.css';
import Link from 'next/link';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { useEffect } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { CampaignCard } from '@/components/CampaignCard';

export default function Home() {
  const { context } = useFarcasterContext();
  const isFarcasterConnected = !!context?.user;
  const userId = context?.user?.fid ? String(context.user.fid) : undefined;

  const { data: allCampaigns } = useCampaigns();
  const userActiveCampaigns = allCampaigns?.filter(c => c.creator === userId && c.status === 'active') || [];

  // Call ready() AFTER UI renders - per official Farcaster docs
  useEffect(() => {
    async function signalReady() {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        await sdk.actions.ready();
        console.log('✅ ready() called after UI render');
      } catch (e) {
        // Not in Farcaster environment
      }
    }
    signalReady();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={`${styles.title} gradient-text`}>
          Post Up
        </h1>
        {isFarcasterConnected && (
          <p className={styles.subtitle}>
            Welcome, {context?.user?.displayName || 'User'}!
          </p>
        )}

        {/* Active Campaigns Section - Always Show */}
        <div style={{ marginTop: '3rem', width: '100%', maxWidth: '1200px' }}>
          {isFarcasterConnected && userActiveCampaigns.length > 0 ? (
            <>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Your Active Campaigns ({userActiveCampaigns.length})</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {userActiveCampaigns.slice(0, 6).map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
              {userActiveCampaigns.length > 6 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Link href="/campaigns" style={{
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}>
                    View all {userActiveCampaigns.length} campaigns →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                {isFarcasterConnected ? 'You have no active campaigns yet.' : 'Sign in to view your campaigns.'}
              </p>
              {isFarcasterConnected && (
                <Link href="/campaigns/new" className="glass-button" style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none'
                }}>
                  Create Your First Campaign
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
