'use client';

import styles from './page.module.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useFarcasterContext } from '@/providers/FarcasterProvider';

export default function Home() {
  const { isConnected } = useAccount();
  const { context, isLoadingContext } = useFarcasterContext();
  const isFarcasterConnected = !!context?.user;

  // Show loading state while checking context
  if (isLoadingContext) {
    return (
      <main className={styles.main}>
        <div className={styles.hero}>
          <div style={{ color: 'var(--muted-foreground)' }}>Loading...</div>
        </div>
      </main>
    );
  }

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
          {!isConnected && !isFarcasterConnected ? (
            <ConnectButton />
          ) : (
            <>
              {/* If connected, show Dashboard buttons */}
              {isFarcasterConnected && !isConnected && (
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}
