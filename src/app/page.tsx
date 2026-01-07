'use client';

import styles from './page.module.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function Home() {
  const { isConnected } = useAccount();

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
          {!isConnected ? (
            <ConnectButton />
          ) : (
            <>
              {/* If connected, show Dashboard buttons */}
              <Link href="/campaigns" className="glass-button" style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                background: 'var(--primary)',
                color: 'white',
                border: 'none'
              }}>
                Launch Campaign
              </Link>
              <Link href="/tasks" className="glass-button" style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: 600
              }}>
                Browse Tasks
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
