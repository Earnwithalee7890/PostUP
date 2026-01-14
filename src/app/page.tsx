'use client';

import styles from './page.module.css';
import Link from 'next/link';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { useEffect } from 'react';
import { Rocket, Users, Trophy, TrendingUp } from 'lucide-react';

export default function Home() {
  const { context } = useFarcasterContext();
  const isFarcasterConnected = !!context?.user;

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
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className={`${styles.title} gradient-text`} style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Post Up
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
            Earn rewards by engaging with campaigns on Farcaster
          </p>
          {isFarcasterConnected && (
            <p style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '2rem',
              display: 'inline-block',
              fontSize: '0.9rem'
            }}>
              👋 Welcome, <strong>{context?.user?.displayName || 'User'}</strong>!
            </p>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          {/* Browse Campaigns */}
          <Link href="/campaigns" style={{ textDecoration: 'none' }} aria-label="Browse available campaigns">
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '1rem',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              <Rocket size={32} style={{ color: '#8b5cf6', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem' }}>Browse Campaigns</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>Earn rewards</div>
            </div>
          </Link>

          {/* Create Campaign */}
          <Link href="/campaigns/new" style={{ textDecoration: 'none' }} aria-label="Create a new campaign">
            <div style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '1rem',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              <Users size={32} style={{ color: '#22c55e', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem' }}>Create Campaign</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>Grow audience</div>
            </div>
          </Link>

          {/* Leaderboard */}
          <Link href="/leaderboard" style={{ textDecoration: 'none' }} aria-label="View leaderboard">
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(234, 88, 12, 0.2) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '1rem',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              <Trophy size={32} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem' }}>Leaderboard</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>Top earners</div>
            </div>
          </Link>

          {/* Profile */}
          <Link href="/profile" style={{ textDecoration: 'none' }} aria-label="View your profile">
            <div style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.2) 100%)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: '1rem',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              <TrendingUp size={32} style={{ color: '#ec4899', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem' }}>My Profile</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>Task history</div>
            </div>
          </Link>
        </div>

        {/* Stats Section */}
        <div style={{
          marginTop: '3rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>10%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Platform Fee</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>90%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>To Rewards</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>Fair</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Distribution</div>
          </div>
        </div>
      </div>
    </main>
  );
}

