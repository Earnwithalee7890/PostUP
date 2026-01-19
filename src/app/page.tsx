'use client';

import styles from './page.module.css';
import Link from 'next/link';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { useEffect, useState } from 'react';
import { Rocket, Users, Trophy, TrendingUp, Share2, PlusCircle, LayoutDashboard } from 'lucide-react';
import { isAdmin } from '@/lib/admin';

export default function Home() {
  const { context } = useFarcasterContext();
  const isFarcasterConnected = !!context?.user;
  const [isAppAdded, setIsAppAdded] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initApp() {
      // Check localStorage first for instant bypass if already added
      const persistedAdded = localStorage.getItem('tip2post_app_added') === 'true';
      if (persistedAdded) {
        setIsAppAdded(true);
        setIsLoading(false);
      }

      if (!context) return;
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        // Initial state from context
        const added = !!context?.client?.added;
        setIsAppAdded(added || persistedAdded);
        setIsNotificationsEnabled(!!context?.client?.notificationDetails);

        if (added) {
          localStorage.setItem('tip2post_app_added', 'true');
        }

        await sdk.actions.ready();
      } catch (e) {
        setIsAppAdded(true);
        setIsNotificationsEnabled(true);
      } finally {
        setIsLoading(false);
      }
    }
    initApp();
  }, [context]);

  const handleAddApp = async () => {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      await sdk.actions.addFrame();
      // If no error, app was added successfully
      setIsAppAdded(true);
      localStorage.setItem('tip2post_app_added', 'true');
    } catch (e) {
      console.log('Add app not available:', e);
      setIsAppAdded(true); // Allow access if SDK not available
      localStorage.setItem('tip2post_app_added', 'true');
    }
  };

  const handleShare = async () => {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      await sdk.actions.composeCast({
        text: 'Check out Tip2Post - earn rewards by engaging with campaigns on Farcaster! 🚀',
        embeds: ['https://post-up-zeta.vercel.app']
      });
    } catch (e) {
      console.log('Share not available');
    }
  };

  // Show add app prompt if not added
  if (!isLoading && !isAppAdded && isFarcasterConnected) {
    return (
      <main className={styles.main}>
        <div className={styles.hero} style={{ textAlign: 'center' }}>
          <Rocket size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h1 className={`${styles.title} gradient-text`} style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Add Tip2Post
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', maxWidth: '300px', margin: '0 auto 2rem' }}>
            Add Tip2Post to your Farcaster to start earning rewards!
          </p>
          <button
            onClick={handleAddApp}
            className="glass-panel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '99px',
              fontWeight: 600,
              fontSize: '1.1rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}
          >
            <PlusCircle size={20} /> Add to Farcaster
          </button>
        </div>
      </main>
    );
  }

  // Show notifications prompt if added but notifications not enabled
  if (!isLoading && isAppAdded && !isNotificationsEnabled && isFarcasterConnected) {
    return (
      <main className={styles.main}>
        <div className={styles.hero} style={{ textAlign: 'center' }}>
          <Share2 size={48} color="#22c55e" style={{ marginBottom: '1.5rem' }} />
          <h1 className={`${styles.title} gradient-text`} style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Stay Notified
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', maxWidth: '300px', margin: '0 auto 2rem' }}>
            Enable notifications to get alerts when you earn rewards or new tasks are available!
          </p>
          <button
            onClick={async () => {
              const { sdk } = await import('@farcaster/miniapp-sdk');
              try {
                await sdk.actions.addFrame(); // This also prompts for notifications if already added
                setIsNotificationsEnabled(true);
              } catch (e) {
                setIsNotificationsEnabled(true);
              }
            }}
            className="glass-panel"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: '#22c55e',
              color: 'white',
              borderRadius: '99px',
              fontWeight: 600,
              fontSize: '1.1rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
            }}
          >
            Enable Notifications
          </button>
          <button
            onClick={() => setIsNotificationsEnabled(true)}
            style={{ display: 'block', margin: '1rem auto', color: 'var(--muted-foreground)', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Maybe Later
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className={`${styles.title} gradient-text`} style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Tip2Post
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

        {/* Creator Dashboard Link - Visible to all for easy access to campaign management */}
        {isFarcasterConnected && (
          <div style={{ marginTop: '1.5rem', width: '100%', maxWidth: '400px', margin: '1.5rem auto 0' }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px border var(--border)',
                borderRadius: '1rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LayoutDashboard size={20} color="white" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem' }}>Creator Dashboard</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Manage your campaigns & rewards</div>
                </div>
              </div>
            </Link>
          </div>
        )}

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

        {/* Share App Button */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(139, 92, 246, 0.2)',
              color: 'var(--primary)',
              borderRadius: '2rem',
              fontWeight: 500,
              fontSize: '0.9rem',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              cursor: 'pointer'
            }}
          >
            <Share2 size={16} /> Share Tip2Post
          </button>
        </div>
      </div>
    </main>
  );
}

