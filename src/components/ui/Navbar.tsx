'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, Layers, User, TrendingUp } from 'lucide-react';
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
                    <span>POST</span>
                    <span className={styles.logoHighlight}>UP</span>
                </Link>

                <div className={styles.navLinks}>
                    <Link href="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
                        <Home size={18} />
                    </Link>
                    <Link href="/campaigns" className={`${styles.navLink} ${isActive('/campaigns') ? styles.active : ''}`}>
                        <Layers size={18} style={{ marginRight: '6px' }} /> Campaigns
                    </Link>
                    <Link href="/tasks" className={`${styles.navLink} ${isActive('/tasks') ? styles.active : ''}`}>
                        <Zap size={18} style={{ marginRight: '6px' }} /> Earn
                    </Link>
                    <Link href="/leaderboard" className={`${styles.navLink} ${isActive('/leaderboard') ? styles.active : ''}`}>
                        <TrendingUp size={18} style={{ marginRight: '6px' }} /> Rank
                    </Link>
                    <Link href="/profile" className={`${styles.navLink} ${isActive('/profile') ? styles.active : ''}`}>
                        <User size={18} style={{ marginRight: '6px' }} /> Profile
                    </Link>
                </div>
            </nav>
        </div>
    );
}
