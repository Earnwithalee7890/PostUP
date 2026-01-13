'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { parseEther, parseUnits, encodePacked, keccak256 } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';
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

import { SuccessModal } from '@/components/SuccessModal';

export default function NewCampaignPage() {
    const router = useRouter();
    const { mutateAsync: createCampaign } = useCreateCampaign();

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

    // Modal State
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);

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

    // Wallet and smart contract integration
    const { address, isConnected } = useAccount();
    const { writeContractAsync: writeApprove } = useWriteContract();
    const { writeContractAsync: writeCreate } = useWriteContract();
    const [isApproving, setIsApproving] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!isFarcasterUser || !userId) {
            alert('Please open this app in Farcaster to create campaigns');
            return;
        }

        if (!isConnected || !address) {
            alert('Please connect your wallet to pay for the campaign');
            return;
        }

        if (!platform || !category || !rewardToken || !budget) {
            alert('Please complete all fields');
            return;
        }

        if (needsProfileUrl && !postUrl.trim()) {
            alert('Please provide a valid URL');
            return;
        }

        if (needsCastUrl && !castUrl.trim()) {
            alert('Please provide a Cast URL');
            return;
        }

        if (!isBudgetValid) {
            alert(budgetError || 'Invalid budget');
            return;
        }

        if (category === 'Multi' && selectedMultiTasks.length === 0) {
            alert('Please select at least one action for Multi campaign');
            return;
        }

        setIsSubmitting(true);

        try {
            const budgetInUSDC = parseUnits(budget.toString(), 6); // USDC has 6 decimals

            // Step 1: Approve USDC
            setIsApproving(true);
            const approveTx = await writeApprove({
                address: USDC_ADDRESS as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [DISTRIBUTOR_ADDRESS as `0x${string}`, budgetInUSDC],
            });
            setIsApproving(false);

            // Step 2: Create campaign on contract
            setIsCreating(true);
            const mockMerkleRoot = keccak256(encodePacked(['string'], ['campaign-' + Date.now()])) as `0x${string}`;

            const createTx = await writeCreate({
                address: DISTRIBUTOR_ADDRESS as `0x${string}`,
                abi: DISTRIBUTOR_ABI,
                functionName: 'createCampaign',
                args: [mockMerkleRoot, USDC_ADDRESS as `0x${string}`, budgetInUSDC],
            });
            setIsCreating(false);

            // Step 3: Save to database
            const selectedCategoryObj = CATEGORIES.find(c => c.id === category);
            const finalTasks = category === 'Multi' ? selectedMultiTasks : (selectedCategoryObj?.tasks || []);
            const estRewardPerTask = netBudget / 50;
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;
            const endedAt = Date.now() + (duration * ONE_DAY_MS);

            const newCampaign = await createCampaign({
                creator: userId!,
                platform: platform!,
                category: category!,
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
                endedAt: endedAt,
            } as any);

            setCreatedCampaignId(newCampaign.id);
            setShowSuccess(true);

        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('Failed to create campaign. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        router.push('/');
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

    // RENDER: Check for Farcaster authentication
    const { context } = useFarcasterContext();
    const isFarcasterUser = !!context?.user;
    // Use Farcaster FID as user identifier
    const userId = context?.user?.fid ? String(context.user.fid) : undefined;

    // Skip category selection - go directly to form with category buttons
    return (
        <div className={styles.container}>
            <SuccessModal
                isOpen={showSuccess}
                onClose={handleSuccessClose}
                title="Campaign Created!"
                message={`Your ${platform} campaign is now live with a budget of ${budget} ${rewardToken}.`}
                actionLabel="View Dashboard"
                onAction={handleSuccessClose}
            />

            <button onClick={() => router.push('/')} className={styles.backButton}>
                <ArrowLeft size={16} /> Back
            </button>

            <header className={styles.header}>
                <h1>New {platform} Campaign</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>

                {/* CATEGORY SELECTOR */}
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Campaign Type</label>
                    <div className={styles.categoryGrid}>
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
                                    className={`${styles.categoryBtn} ${isActive ? styles.categoryActive : ''}`}
                                >
                                    <Icon size={20} className={styles.categoryIcon} />
                                    <span className={styles.categoryLabel}>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* MULTI TASK SELECTOR */}
                {category === 'Multi' && (
                    <div className={styles.panel}>
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
                                        {action.label}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedMultiTasks.length > 0 && (
                            <div className={styles.multiSummary} style={{ marginTop: '1rem' }}>
                                <div>
                                    <div className={styles.multiTitle}>{selectedMultiTasks.join(' + ')}</div>
                                    <div className={styles.multiSubtitle}>Users must complete all actions</div>
                                </div>
                            </div>
                        )}
                    </div>
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

                {/* REQUIREMENTS TOGGLES - REMOVED FOR CLEANER UI */}

                {/* BUDGET - COMPACT */}
                {/* BUDGET SECTION */}
                <div className={styles.budgetCard}>
                    <div className={styles.inputLabel} style={{ textAlign: 'center', marginBottom: '0.5rem' }}>TOTAL BUDGET</div>
                    <div className={styles.budgetInputWrapper}>
                        <span className={styles.currencySymbol}>$</span>
                        <input
                            type="number"
                            value={totalBudget}
                            onChange={(e) => setTotalBudget(e.target.value)}
                            placeholder="50"
                            required
                            min="0.01"
                            className={styles.budgetInput}
                        />
                    </div>

                    {/* TOKEN SELECTION */}
                    <div className={styles.selectorGrid} style={{ marginTop: '1.5rem' }}>
                        {visibleTokens.map(token => (
                            <button
                                key={token.symbol}
                                type="button"
                                onClick={() => setRewardToken(token.symbol)}
                                className={`${styles.selectorBtn} ${rewardToken === token.symbol ? styles.selectorActive : ''}`}
                            >
                                {token.symbol}
                            </button>
                        ))}
                    </div>
                    {budgetError && <div style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.85rem' }}>{budgetError}</div>}
                </div>

                {/* DURATION */}
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Campaign Duration</label>
                    <div className={styles.selectorGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        {[1, 2, 3].map(d => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => setDuration(d as 1 | 2 | 3)}
                                className={`${styles.selectorBtn} ${duration === d ? styles.selectorActive : ''}`}
                            >
                                <Clock size={16} /> {d} Day{d > 1 ? 's' : ''}
                            </button>
                        ))}
                    </div>
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
                <div style={{ marginBottom: '100px' }}>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting || !isFarcasterUser || !isConnected}
                        style={{
                            opacity: (isFarcasterUser && isConnected && !isSubmitting) ? 1 : 0.5,
                            cursor: (isFarcasterUser && isConnected && !isSubmitting) ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {isApproving && 'Approving USDC...'}
                        {isCreating && 'Creating on Blockchain...'}
                        {!isApproving && !isCreating && !isSubmitting && `Pay ${totalBudget} ${rewardToken} & Create`}
                        {!isApproving && !isCreating && isSubmitting && 'Saving...'}
                    </button>
                    {!isConnected && (
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                            💳 Connect wallet (Metamask, OKX, Bitget, etc) to create campaigns
                        </p>
                    )}
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
