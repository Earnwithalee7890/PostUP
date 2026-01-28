'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, User, TrendingUp } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from './Navbar.module.css';

export function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className={styles.navbarWrapper}>
            <nav className={styles.navbar}>
                <Link href="/" className={styles.logo}>
                    <div style={{ position: 'relative', width: 28, height: 28, marginRight: 8 }}>
                        <img src="/logos/postup_p.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span>Tip2</span>
                    <span className={styles.logoHighlight}>Post</span>
                </Link>

                <div className={styles.navLinks}>
                    <Link href="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
                        <Home size={18} style={{ marginRight: '6px' }} /> Home
                    </Link>
                    <Link href="/campaigns" className={`${styles.navLink} ${isActive('/campaigns') ? styles.active : ''}`}>
                        <Layers size={18} style={{ marginRight: '6px' }} /> Campaigns
                    </Link>

                    <Link href="/leaderboard" className={`${styles.navLink} ${isActive('/leaderboard') ? styles.active : ''}`}>
                        <TrendingUp size={18} style={{ marginRight: '6px' }} /> Rank
                    </Link>
                    <Link href="/profile" className={`${styles.navLink} ${isActive('/profile') ? styles.active : ''}`}>
                        <User size={18} style={{ marginRight: '6px' }} /> Profile
                    </Link>
                </div>

                {/* Wallet Connect Button */}
                <div style={{ marginLeft: 'auto' }}>
                    <ConnectButton showBalance={false} chainStatus="icon" />
                </div>
            </nav>
        </div>
    );
}
