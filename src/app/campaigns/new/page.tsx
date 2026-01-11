'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { parseEther, parseUnits } from 'viem';
import { DISTRIBUTOR_ADDRESS, USDC_ADDRESS } from '@/lib/config';
import { DISTRIBUTOR_ABI } from '@/lib/abi';
import { ERC20_ABI } from '@/lib/erc20';
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
    }
];

const CATEGORIES = [
    { id: 'Follow' as CampaignCategory, label: 'Follow', icon: UserPlus, tasks: ['Follow'] as TaskType[] },
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
    const { mutate: createCampaign } = useCreateCampaign();

    // Steps: 0 = Platform Selection, 1 = Campaign Details
    const [platform, setPlatform] = useState<Platform>('Farcaster'); // Auto-select Farcaster
    const [category, setCategory] = useState<CampaignCategory>('Follow'); // Auto-select Follow by default
    const [postUrl, setPostUrl] = useState('');
    const [castUrl, setCastUrl] = useState('');
    const [rewardToken, setRewardToken] = useState('USDC');
    const [totalBudget, setTotalBudget] = useState('');
    const [require200Followers, setRequire200Followers] = useState(false);
    const [requirePro, setRequirePro] = useState(false);
    const [showAllTokens, setShowAllTokens] = useState(false);
    const [duration, setDuration] = useState<1 | 2 | 3>(1);

    // Multi-task selection
    const [selectedMultiTasks, setSelectedMultiTasks] = useState<TaskType[]>([]);

    const budget = parseFloat(totalBudget) || 0;
    const platformFee = budget * 0.15;
    const netBudget = budget - platformFee;

    const MINIMUM_BUDGET = 0.01;
    const isBudgetValid = budget >= MINIMUM_BUDGET;
    const budgetError = totalBudget && budget < MINIMUM_BUDGET ? `Minimum budget is $${MINIMUM_BUDGET}` : '';

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

    const { isConnected, address } = useAccount();
    const { writeContract, data: hash, isPending: isConfirming, reset } = useWriteContract();
    const [lastAction, setLastAction] = useState<'approve' | 'create' | null>(null);

    // Check USDC/USDT Allowance
    const tokenAddress = rewardToken === 'USDC'
        ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'  // Base USDC
        : '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'; // Base USDT

    const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, DISTRIBUTOR_ADDRESS as `0x${string}`],
        query: {
            enabled: !!address && (rewardToken === 'USDC' || rewardToken === 'USDT'),
        }
    });

    const currentAllowance = allowanceData ? BigInt(allowanceData.toString()) : BigInt(0);
    const requiredAmount = parseUnits(totalBudget, 6);
    const needsApproval = (rewardToken === 'USDC' || rewardToken === 'USDT') && currentAllowance < requiredAmount;

    const { isLoading: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const [hasCreated, setHasCreated] = useState(false);

    // Effect to handle success after transaction confirmation
    useEffect(() => {
        if (isConfirmed && hash && !hasCreated) {
            if (lastAction === 'approve') {
                refetchAllowance();
                reset();
                setLastAction(null);
            } else if (lastAction === 'create') {
                // Prevent duplicate creation
                setHasCreated(true);

                const selectedCategoryObj = CATEGORIES.find(c => c.id === category);
                const finalTasks = category === 'Multi' ? selectedMultiTasks : (selectedCategoryObj?.tasks || []);
                const estRewardPerTask = netBudget / 50;
                const ONE_DAY_MS = 24 * 60 * 60 * 1000;
                const endedAt = Date.now() + (duration * ONE_DAY_MS);


                createCampaign({
                    creator: address || '0x00',
                    platform: platform!,
                    category: category!,  // Non-null assertion - category is guaranteed to exist here
                    postUrl: postUrl,
                    castUrl: castUrl,
                    tasks: finalTasks,
                    rewardToken: rewardToken as any,
                    totalBudget: budget,
                    platformFee: platformFee,
                    netBudget: netBudget,
                    rewardAmountPerTask: estRewardPerTask,
                    minFollowers: require200Followers ? 200 : 0,
                    requirePro: requirePro,
                    endedAt: endedAt
                });

                // Redirect after short delay
                setTimeout(() => {
                    router.push('/tasks');
                }, 1500);
            }
        }
    }, [isConfirmed, hash, lastAction, hasCreated, refetchAllowance, reset, router, createCampaign, address, platform, category, postUrl, castUrl, selectedMultiTasks, rewardToken, budget, platformFee, netBudget, require200Followers, requirePro, duration]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            alert('Please connect wallet');
            return;
        }

        // Full validation
        if (!platform || !category || !rewardToken || !budget) {
            alert('Please complete all fields');
            return;
        }

        if (needsProfileUrl && !postUrl.trim()) {
            alert('Please provide a valid URL');
            return;
        }

        try {
            if (needsApproval) {
                // APPROVE FLOW
                setLastAction('approve');

                const tokenAddress = rewardToken === 'USDC'
                    ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'  // Base USDC
                    : '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'; // Base USDT

                const approvalAmount = parseUnits(totalBudget, 6);

                writeContract({
                    address: tokenAddress as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [DISTRIBUTOR_ADDRESS as `0x${string}`, approvalAmount]
                });
            } else {
                // CREATE FLOW
                setLastAction('create');

                // Get token address based on selection
                const tokenAddress = rewardToken === 'USDC'
                    ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'  // Base USDC
                    : '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'; // Base USDT

                const amountInDecimals = parseUnits(totalBudget, 6); // USDC/USDT both use 6 decimals

                writeContract({
                    address: DISTRIBUTOR_ADDRESS as `0x${string}`,
                    abi: DISTRIBUTOR_ABI,
                    functionName: 'createCampaign',
                    args: [
                        '0x0000000000000000000000000000000000000000000000000000000000000000', // Initial empty root
                        tokenAddress as `0x${string}`, // Token address
                        amountInDecimals // Amount in token decimals
                    ],
                });
            }
        } catch (err) {
            console.error(err);
            alert('Failed to execute transaction');
            setLastAction(null);
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
    // Get address from Farcaster verified addresses
    const userAddress = context?.user?.verifications?.[0] || address;

    // Skip category selection - go directly to form with category buttons
    return (
        <div className={styles.container}>
            <button onClick={() => router.push('/')} className={styles.backButton}>
                <ArrowLeft size={16} /> Back
            </button>

            <header className={styles.header}>
                <h1>New {platform} Campaign</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>

                {/* CATEGORY SELECTOR - Horizontal buttons in form */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '2rem',
                    flexWrap: 'nowrap',
                    justifyContent: 'center',
                    overflowX: 'auto'
                }}>
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = category === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                    setCategory(cat.id);
                                    if (cat.id !== 'Multi') {
                                        setSelectedMultiTasks([]);
                                    }
                                }}
                                className={styles.platformCard}
                                style={{
                                    flex: '1 1 150px',
                                    maxWidth: '180px',
                                    padding: '1rem 0.75rem',
                                    textAlign: 'center',
                                    border: isActive ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                    background: isActive ? 'rgba(165, 166, 246, 0.1)' : 'rgba(255,255,255,0.03)'
                                }}
                            >
                                <Icon size={24} style={{ margin: '0 auto 0.5rem', color: isActive ? 'var(--primary)' : 'inherit' }} />
                                <h3 style={{ fontSize: '0.9rem', marginBottom: '0' }}>{cat.label}</h3>
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
                            placeholder="20"
                            required
                            min="0.01"
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
                        onClick={() => setDuration(2)}
                        className={`${styles.durationBtn} ${duration === 2 ? styles.durationActive : ''}`}
                    >
                        <Clock className={styles.clock} size={24} />
                        <span>2 Days</span>
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
                            <span className={`${styles.breakdownLabel} ${styles.feeText}`}>Fee (15%)</span>
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
                <div style={{ marginBottom: '100px' }}> {/* Extra space to prevent overlap with footer */}
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isConfirming}
                        style={{
                            opacity: isConnected ? 1 : 0.5,
                            cursor: isConnected ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {needsApproval ? (
                            isConfirming && lastAction === 'approve' ? 'Approving...' : `Approve ${rewardToken}`
                        ) : (
                            isConfirming && lastAction === 'create' ? 'Creating...' : `Create Task (${totalBudget} ${rewardToken})`
                        )}
                    </button>
                </div>

                {category === 'MiniApp' && (
                    <p className={styles.miniAppNote}>
                        Users will open your mini app and submit a screenshot as proof
                    </p>
                )}


            </form>
        </div>
    );
}
