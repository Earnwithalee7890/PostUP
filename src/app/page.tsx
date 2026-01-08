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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Developer</span>
                <a href="https://warpcast.com/aleekhoso" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>@aleekhoso</a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Admin</span>
                <a href="https://warpcast.com/tipsdeck" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>@tipsdeck</a>
              </div>
              <div style={{ height: '1px', background: 'var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Platform Fee</span>
                <span>18%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Distribution</span>
                <span>Quality Score Weighted</span>
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
                Post Up is a long-term platform designed to grow your onchain presence with real users.
              </div>
            </div>
          </dialog>
        </div>
      </div>
    </main>
  );
}
