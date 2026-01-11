'use client';

import styles from './page.module.css';
import Link from 'next/link';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { useEffect } from 'react';

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
        <h1 className={`${styles.title} gradient-text`}>
          Post Up
        </h1>
        <p className={styles.subtitle}>
          The task-based onchain growth engine. Promote your content or earn by engaging.
        </p>

        <div className={styles.actions}>
          {isFarcasterConnected && (
            <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
              Welcome, {context?.user?.displayName}!
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/campaigns" className="glass-button" style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              background: 'var(--primary)',
              color: 'white',
              textDecoration: 'none',
              border: 'none'
            }}>
              Launch Campaign
            </Link>
            <Link href="/tasks" className="glass-button" style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid var(--border)'
            }}>
              Browse Tasks
            </Link>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={() => (document.getElementById('about-modal') as HTMLDialogElement)?.showModal()}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            About Platform
          </button>
        </div>

        <dialog id="about-modal" style={{
          padding: '2rem',
          borderRadius: '1rem',
          border: '1px solid var(--border)',
          background: 'var(--background)',
          color: 'var(--foreground)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>About Post Up</h3>
            <form method="dialog">
              <button style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>✕</button>
            </form>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>

            <div>
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--foreground)' }}>How it Works</h4>
              <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
                Post Up helps you grow onchain. Create tasks and reward real users for engagement.
              </p>
            </div>

            <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>Platform Fee</span>
                <span style={{ color: 'var(--primary)' }}>15%</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                We charge a 15% service fee upfront. 85% of your budget goes directly to the user reward pool.
              </p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--foreground)' }}>Fair Distribution</h4>
              <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
                Rewards are distributed based on <strong>Quality Score</strong>.
                High-quality users (active,verified) earn significantly more than low-activity bots.
              </p>
            </div>

            <div style={{ height: '1px', background: 'var(--border)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact & Support</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <a href="https://warpcast.com/aleekhoso" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>@aleekhoso (Dev)</a>
                <a href="https://warpcast.com/tipsdeck" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>@tipsdeck (Admin)</a>
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                Reach out for promotions, partnerships, or support.
              </p>
            </div>
          </div>
        </dialog>
      </div>
    </main>
  );
}
