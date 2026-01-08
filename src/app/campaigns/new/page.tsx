'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import { DISTRIBUTOR_ADDRESS } from '@/lib/config';
import { DISTRIBUTOR_ABI } from '@/lib/abi';
import { SUPPORTED_TOKENS, TaskType, Platform, CampaignCategory } from '@/lib/types';
import { UserPlus, Heart, Zap, Hash, Grid3x3, Smartphone, ArrowLeft, ChevronRight, Clock } from 'lucide-react';
import styles from './new.module.css';

// Platform Logos
import Image from 'next/image';

// Platform Logos
const FarcasterLogo = () => (
    <div style={{ position: 'relative', width: 32, height: 32 }}>
        <Image
            src="/logos/farcaster_v2.png"
            alt="Farcaster"
            fill
            style={{ objectFit: 'contain' }}
        />
    </div>
);

const XLogo = () => (
    <div style={{ position: 'relative', width: 32, height: 32 }}>
        <Image
            src="/logos/logo_1.png"
            alt="X"
            fill
            style={{ objectFit: 'contain' }}
        />
    </div>
);

const BaseLogo = () => (
    <div style={{ position: 'relative', width: 32, height: 32 }}>
        <Image
            src="/logos/base_v2.png"
            alt="Base"
            fill
            style={{ objectFit: 'contain', borderRadius: '4px' }}
        />
    </div>
);


const SUPPORTED_PLATFORMS = [
    {
        id: 'Farcaster' as Platform,
        label: 'Farcaster',
        logo: FarcasterLogo,
        description: 'Grow your Warpcast audience with follows, likes, and recasts.'
    },
    {
        id: 'X' as Platform,
        label: 'X (Twitter)',
        logo: XLogo,
        description: 'Boost engagement on your X posts and profile.'
    },
    {
        id: 'Base' as Platform,
        label: 'Base',
        logo: BaseLogo,
        description: 'Drive on-chain actions and community growth.'
    }
];

const CATEGORIES = [
    { id: 'Follow' as CampaignCategory, label: 'Follow', icon: UserPlus, tasks: ['Follow'] as TaskType[] },
    { id: 'Channel' as CampaignCategory, label: 'Channel', icon: Hash, tasks: ['JoinChannel'] as TaskType[] },
    { id: 'Boost' as CampaignCategory, label: 'Boost', icon: Zap, tasks: ['Like', 'Repost'] as TaskType[] },
    { id: 'MiniApp' as CampaignCategory, label: 'Mini App', icon: Smartphone, tasks: ['OpenMiniApp'] as TaskType[] },
    { id: 'Multi' as CampaignCategory, label: 'Multi', icon: Grid3x3, tasks: [] as TaskType[] },
];

const MULTI_ACTIONS = [
    { id: 'Follow' as TaskType, label: 'Follow' },
    { id: 'Like' as TaskType, label: 'Like' },
    { id: 'Repost' as TaskType, label: 'Recast' },
    { id: 'Comment' as TaskType, label: 'Reply' },
    { id: 'Cast' as TaskType, label: 'Cast' },
];

export default function NewCampaignPage() {
    const router = useRouter();
    const createMutation = useCreateCampaign();

    // Steps: 0 = Platform Selection, 1 = Campaign Details
    const [platform, setPlatform] = useState<Platform | null>(null);
    const [category, setCategory] = useState<CampaignCategory>('Follow');
    const [postUrl, setPostUrl] = useState('');
    const [castUrl, setCastUrl] = useState('');
    const [rewardToken, setRewardToken] = useState('USDC');
    const [totalBudget, setTotalBudget] = useState('');
    const [require200Followers, setRequire200Followers] = useState(false);
    const [requirePro, setRequirePro] = useState(false);
    const [showAllTokens, setShowAllTokens] = useState(false);
    const [duration, setDuration] = useState<1 | 3>(1);

    // Multi-task selection
    const [selectedMultiTasks, setSelectedMultiTasks] = useState<TaskType[]>([]);

    const budget = parseFloat(totalBudget) || 0;
    const platformFee = budget * 0.18;
    const netBudget = budget - platformFee;

    const MINIMUM_BUDGET = 15;
    const isBudgetValid = budget > MINIMUM_BUDGET;
    const budgetError = totalBudget && budget <= MINIMUM_BUDGET ? `Type any amount higher then ${MINIMUM_BUDGET}` : '';

    // Filter categories based on platform
    const visibleCategories = CATEGORIES.filter(cat => {
        if (!platform) return false;

        // Farcaster: All categories
        if (platform === 'Farcaster') return true;

        // X: Follow, Boost, Multi
        if (platform === 'X') return ['Follow', 'Boost', 'Multi'].includes(cat.id);

        // Base: Follow, Channel (maybe community?), Boost, Multi. EXCLUDE Mini App
        if (platform === 'Base') return ['Follow', 'Boost', 'Multi'].includes(cat.id);

        return false;
    });

    const handlePlatformSelect = (p: Platform) => {
        setPlatform(p);
        setCategory('Follow'); // Reset to default
    };

    const handleCategorySelect = (cat: typeof CATEGORIES[0]) => {
        setCategory(cat.id);
        if (cat.id !== 'Multi') {
            setSelectedMultiTasks([]);
        }
    };

    const toggleMultiTask = (task: TaskType) => {
        if (selectedMultiTasks.includes(task)) {
            setSelectedMultiTasks(selectedMultiTasks.filter(t => t !== task));
        } else {
            setSelectedMultiTasks([...selectedMultiTasks, task]);
        }
    };

    const { isConnected } = useAccount();
    const { writeContract, data: hash, isPending: isConfirming } = useWriteContract();

    const { isLoading: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    // Effect to handle success after transaction confirmation
    if (isConfirmed && hash) {
        // Here we would normally call the backend APIs to persist the campaign
        // For now, we simulate success
        // createMutation.mutate(...)
        alert(`Campaign created! Transaction Hash: ${hash}`);
        router.push('/campaigns');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isBudgetValid || !platform) return;

        // Ensure user is on Base Sepolia? (Wagmi handles chain switching request usually if configured, or fails)

        try {
            writeContract({
                address: DISTRIBUTOR_ADDRESS as `0x${string}`,
                abi: DISTRIBUTOR_ABI,
                functionName: 'createCampaign',
                args: [
                    '0x0000000000000000000000000000000000000000000000000000000000000000' // Initial empty root
                ],
                value: parseEther(totalBudget)
            });
        } catch (err) {
            console.error(err);
            alert('Failed to create campaign on-chain');
        }
    };

    const visibleTokens = showAllTokens ? SUPPORTED_TOKENS : SUPPORTED_TOKENS.slice(0, 2);

    // Compute which URLs are needed
    const needsProfileUrl = category === 'Follow' || category === 'MiniApp' || (category === 'Multi' && selectedMultiTasks.includes('Follow'));
    const needsCastUrl = category === 'Boost' || (category === 'Multi' && (selectedMultiTasks.includes('Like') || selectedMultiTasks.includes('Repost') || selectedMultiTasks.includes('Comment')));

    // Get input labels based on platform
    const getProfileLabel = () => {
        if (category === 'MiniApp') return 'Mini App URL';
        if (platform === 'X') return 'X Username / Profile Link';
        if (platform === 'Base') return 'Base Wallet / Profile';
        return 'Farcaster Profile URL';
    };

    const getCastLabel = () => {
        if (platform === 'X') return 'X Post Link';
        return 'Cast URL';
    };

    // RENDER: Check for wallet connection
    const { context } = useFarcasterContext();
    const isFarcasterUser = !!context?.user;

    if (!isConnected) {
        return (
            <div className={styles.container}>
                <button onClick={() => router.push('/')} className={styles.backButton}>
                    <ArrowLeft size={16} /> Back
                </button>
                <header className={styles.header} style={{ marginTop: '2rem' }}>
                    <h1>{isFarcasterUser ? 'Verifying Identity...' : 'Connect Wallet'}</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        {isFarcasterUser
                            ? 'Syncing with your Farcaster client...'
                            : 'You need to connect a wallet to fund and create a campaign.'}
                    </p>
                </header>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                    {isFarcasterUser ? (
                        <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem' }}>
                            <Clock className="spin" size={32} style={{ opacity: 0.5 }} />
                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Please approve the connection in your wallet if prompted.</span>
                        </div>
                    ) : (
                        <ConnectButton />
                    )}
                </div>
            </div>
        );
    }

    // RENDER: Platform Selection
    if (!platform) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Select Platform</h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Choose where to grow your audience</p>
                </header>

                <div className={styles.platformGrid}>
                    {SUPPORTED_PLATFORMS.map(p => (
                        <div
                            key={p.id}
                            className={styles.platformCard}
                            onClick={() => handlePlatformSelect(p.id)}
                        >
                            <div className={styles.platformIconWrapper}>
                                <p.logo />
                            </div>
                            <div className={styles.platformContent}>
                                <div className={styles.platformName}>{p.label}</div>
                                <div className={styles.platformDesc}>{p.description}</div>
                            </div>
                            <ChevronRight className={styles.arrowIcon} />
                        </div>
                    ))}
                </div>

                {/* PROMOTION CONTACT */}
                <div className={styles.promotionContact}>
                    Need help or promotion? Contact <a href="https://warpcast.com/aleekhoso" target="_blank" rel="noreferrer" className={styles.promotionLink}>@aleekhoso</a> (Dev) or <a href="https://warpcast.com/tipsdeck" target="_blank" rel="noreferrer" className={styles.promotionLink}>@tipsdeck</a> (Admin) on Farcaster.
                </div>
            </div>
        );
    }

    // RENDER: Campaign Details Form
    return (
        <div className={styles.container}>
            <button onClick={() => setPlatform(null)} className={styles.backButton}>
                <ArrowLeft size={16} /> Back to Platforms
            </button>

            <header className={styles.header}>
                <h1>New {platform} Campaign</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>

                {/* CATEGORY ICONS */}
                <div className={styles.categoryGrid}>
                    {visibleCategories.map(cat => {
                        const Icon = cat.icon;
                        const isActive = category === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleCategorySelect(cat)}
                                className={`${styles.categoryBtn} ${isActive ? styles.categoryActive : ''}`}
                            >
                                <Icon size={20} />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* MULTI TASK SELECTOR */}
                {category === 'Multi' && (
                    <>
                        {selectedMultiTasks.length > 0 && (
                            <div className={styles.multiSummary}>
                                <div className={styles.multiIcons}>
                                    {selectedMultiTasks.map((t, i) => (
                                        <span key={i} className={styles.taskIcon}>●</span>
                                    ))}
                                </div>
                                <div>
                                    <div className={styles.multiTitle}>{selectedMultiTasks.join(' + ')}</div>
                                    <div className={styles.multiSubtitle}>Users must complete all actions</div>
                                </div>
                            </div>
                        )}

                        <div className={styles.multiGrid}>
                            {MULTI_ACTIONS.map(action => {
                                const isSelected = selectedMultiTasks.includes(action.id);
                                return (
                                    <button
                                        key={action.id}
                                        type="button"
                                        onClick={() => toggleMultiTask(action.id)}
                                        className={`${styles.multiActionBtn} ${isSelected ? styles.multiActionActive : ''}`}
                                    >
                                        {isSelected && '✓ '}{action.label}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* URL INPUTS */}
                {needsProfileUrl && (
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                            {getProfileLabel()}
                        </label>
                        <input
                            className={styles.urlInput}
                            value={postUrl}
                            onChange={(e) => setPostUrl(e.target.value)}
                            placeholder="https://..."
                            required
                        />
                    </div>
                )}

                {needsCastUrl && (
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>{getCastLabel()}</label>
                        <input
                            className={styles.urlInput}
                            value={castUrl}
                            onChange={(e) => setCastUrl(e.target.value)}
                            placeholder="https://..."
                            required={category === 'Boost' || selectedMultiTasks.some(t => ['Like', 'Repost', 'Comment'].includes(t))}
                        />
                    </div>
                )}

                {category === 'Channel' && (
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Channel ID</label>
                        <input
                            className={styles.urlInput}
                            value={postUrl}
                            onChange={(e) => setPostUrl(e.target.value)}
                            placeholder="channelid"
                            required
                        />
                    </div>
                )}

                {/* REQUIREMENTS TOGGLES (FARCASTER ONLY) */}
                {platform === 'Farcaster' && (
                    <div className={styles.pillGroup}>
                        <button
                            type="button"
                            className={`${styles.pill} ${require200Followers ? styles.pillActive : ''}`}
                            onClick={() => setRequire200Followers(!require200Followers)}
                        >
                            {require200Followers && '✓ '}200+ Followers
                        </button>
                        <button
                            type="button"
                            className={`${styles.pill} ${requirePro ? styles.pillActive : ''}`}
                            onClick={() => setRequirePro(!requirePro)}
                        >
                            {requirePro && '✓ '}Farcaster Pro
                        </button>
                    </div>
                )}

                {/* BUDGET */}
                <div className={styles.budgetSection}>
                    <div className={styles.budgetInput}>
                        <span className={styles.currency}>$</span>
                        <input
                            type="number"
                            value={totalBudget}
                            onChange={(e) => setTotalBudget(e.target.value)}
                            placeholder="14"
                            required
                            min="10"
                            className={styles.budgetField}
                        />
                    </div>
                    {budgetError && (
                        <div className={styles.budgetError}>
                            ⚠️ {budgetError}
                        </div>
                    )}
                </div>

                {/* TOKEN SELECTION */}
                <div className={styles.tokenGrid}>
                    {visibleTokens.map(token => (
                        <button
                            key={token.symbol}
                            type="button"
                            onClick={() => setRewardToken(token.symbol)}
                            className={`${styles.tokenBtn} ${rewardToken === token.symbol ? styles.tokenActive : ''}`}
                        >
                            <div className={styles.tokenContent}>
                                <span className={styles.tokenSymbol}>{token.symbol}</span>
                                <span className={styles.tokenChain}>{token.chain}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className={styles.moreTokens}
                    onClick={() => setShowAllTokens(!showAllTokens)}
                >
                    {showAllTokens ? 'Less tokens ↑' : 'More tokens ↓'}
                </button>

                {/* DURATION */}
                <div className={styles.durationGrid}>
                    <button
                        type="button"
                        onClick={() => setDuration(1)}
                        className={`${styles.durationBtn} ${duration === 1 ? styles.durationActive : ''}`}
                    >
                        <Clock className={styles.clock} size={24} />
                        <span>1 Day</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setDuration(3)}
                        className={`${styles.durationBtn} ${duration === 3 ? styles.durationActive : ''}`}
                    >
                        <Clock className={styles.clock} size={24} />
                        <span>3 Days</span>
                    </button>
                </div>

                {/* FEE BREAKDOWN */}
                {budget > 0 && (
                    <div className={styles.breakdown}>
                        <div className={styles.breakdownRow}>
                            <span className={styles.breakdownLabel}>Total</span>
                            <span className={styles.breakdownValue}>{budget.toFixed(6)} {rewardToken}</span>
                        </div>
                        <div className={styles.breakdownRow}>
                            <span className={`${styles.breakdownLabel} ${styles.feeText}`}>Fee (18%)</span>
                            <span className={`${styles.breakdownValue} ${styles.feeText}`}>-{platformFee.toFixed(6)} {rewardToken}</span>
                        </div>
                        <div className={`${styles.breakdownRow} ${styles.netRow}`}>
                            <span className={styles.breakdownLabel}>Net Reward</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span className={styles.netValue}>{netBudget.toFixed(6)} {rewardToken}</span>
                                <span className={styles.usdValue}>${netBudget.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* SUBMIT */}
                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isConfirming || isConfirmed || !isBudgetValid || !totalBudget}
                >
                    {isConfirming
                        ? 'Confirming in Wallet...'
                        : isConfirmed
                            ? 'Transaction Pending...'
                            : `Create Task (${budget.toFixed(4)} ${rewardToken})`
                    }
                </button>

                {category === 'MiniApp' && (
                    <p className={styles.miniAppNote}>
                        Users will open your mini app and submit a screenshot as proof
                    </p>
                )}

                {/* PROMOTION CONTACT */}
                <div className={styles.promotionContact}>
                    Need help or promotion? Contact <a href="https://warpcast.com/aleekhoso" target="_blank" rel="noreferrer" className={styles.promotionLink}>@aleekhoso</a> (Dev) or <a href="https://warpcast.com/tipsdeck" target="_blank" rel="noreferrer" className={styles.promotionLink}>@tipsdeck</a> (Admin) on Farcaster.
                </div>
            </form>
        </div>
    );
}
