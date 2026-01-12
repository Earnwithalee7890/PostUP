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
            <Link href="/campaigns/new" className="glass-button" style={{
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
          </div>
        </div>
      </div>
    </main>
  );
}
