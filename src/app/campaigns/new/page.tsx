'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { decodeEventLog, parseUnits, encodePacked, keccak256 } from 'viem';
import { useAccount, useWriteContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from 'viem/actions';
import { DISTRIBUTOR_ADDRESS, USDC_ADDRESS } from '@/lib/config';
import { DISTRIBUTOR_ABI } from '@/lib/abi';
import { ERC20_ABI } from '@/lib/erc20';
import { SUPPORTED_TOKENS, TaskType, Platform, CampaignCategory } from '@/lib/types';
import { UserPlus, Zap, Grid3x3, Smartphone, ArrowLeft } from 'lucide-react';
import styles from './new.module.css';
import { SuccessModal } from '@/components/SuccessModal';

const CATEGORIES = [
    { id: 'Follow' as CampaignCategory, label: 'Follow', icon: UserPlus, tasks: ['Follow'] as TaskType[] },
    { id: 'Boost' as CampaignCategory, label: 'Boost', icon: Zap, tasks: ['Like', 'Repost'] as TaskType[] },
    { id: 'MiniApp' as CampaignCategory, label: 'Mini App', icon: Smartphone, tasks: ['OpenMiniApp'] as TaskType[] },
    { id: 'Multi' as CampaignCategory, label: 'Multi', icon: Grid3x3, tasks: [] as TaskType[] },
];

export default function NewCampaignPage() {
    const _router = useRouter();
    const { mutateAsync: createCampaign } = useCreateCampaign();
    const { context } = useFarcasterContext();
    const isFarcasterUser = !!context?.user;
    const userId = context?.user?.fid ? String(context.user.fid) : undefined;

    const [platform] = useState<Platform>('Farcaster');
    const [category, setCategory] = useState<CampaignCategory>('Follow');
    const [postUrl, setPostUrl] = useState('');
    const [castUrl, setCastUrl] = useState('');
    const [rewardToken, setRewardToken] = useState('USDC');
    const [totalBudget, setTotalBudget] = useState('');
    const [_require200Followers] = useState(false);
    const [_requirePro] = useState(false);
    const [_showAllTokens] = useState(false);
    const [duration] = useState<1 | 2 | 3>(1);

    const [selectedMultiTasks, setSelectedMultiTasks] = useState<TaskType[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [_createdCampaignId, _setCreatedCampaignId] = useState<string | null>(null);

    const budget = parseFloat(totalBudget) || 0;
    const platformFee = budget * 0.15;
    const netBudget = budget - platformFee;
    const MINIMUM_BUDGET = 3.0;
    const isBudgetValid = budget >= MINIMUM_BUDGET;
    const budgetError = totalBudget && budget < MINIMUM_BUDGET ? `Minimum budget for today is $${MINIMUM_BUDGET}` : '';

    const handleCategorySelect = (cat: typeof CATEGORIES[0]) => {
        setCategory(cat.id);
        if (cat.id === 'Multi') {
            setSelectedMultiTasks(['Follow', 'Like', 'Repost', 'Comment']);
        } else {
            setSelectedMultiTasks([]);
        }
    };

    const { address, isConnected } = useAccount();
    const wagmiConfig = useConfig();
    const { writeContractAsync: writeApprove } = useWriteContract();
    const { writeContractAsync: writeCreate } = useWriteContract();
    const [isApproving, setIsApproving] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const needsProfileUrl = category === 'Follow' || category === 'MiniApp' || (category === 'Multi' && selectedMultiTasks.includes('Follow'));
    const needsCastUrl = category === 'Boost' || (category === 'Multi' && (selectedMultiTasks.includes('Like') || selectedMultiTasks.includes('Repost') || selectedMultiTasks.includes('Comment')));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFarcasterUser || !userId) { alert('Please open in Farcaster'); return; }
        if (!isConnected || !address) { alert('Connect wallet'); return; }
        if (!platform || !category || !rewardToken || !budget) { alert('Complete all fields'); return; }
        if (needsProfileUrl && !postUrl.trim()) { alert('Provide URL'); return; }
        if (needsCastUrl && !castUrl.trim()) { alert('Provide Cast URL'); return; }
        if (!isBudgetValid) { alert(budgetError); return; }

        setIsSubmitting(true);
        try {
            const budgetInUSDC = parseUnits(budget.toString(), 6);
            setIsApproving(true);
            await writeApprove({
                address: USDC_ADDRESS as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [DISTRIBUTOR_ADDRESS as `0x${string}`, budgetInUSDC],
            });
            setIsApproving(false);

            setIsCreating(true);
            const mockMerkleRoot = keccak256(encodePacked(['string'], ['campaign-' + Date.now()])) as `0x${string}`;
            const createTxHash = await writeCreate({
                address: DISTRIBUTOR_ADDRESS as `0x${string}`,
                abi: DISTRIBUTOR_ABI,
                functionName: 'createCampaign',
                args: [mockMerkleRoot, USDC_ADDRESS as `0x${string}`, budgetInUSDC],
            });

            const receipt = await waitForTransactionReceipt(wagmiConfig as any, { hash: createTxHash });
            let onchainId = 0;
            for (const log of receipt.logs) {
                try {
                    const event = decodeEventLog({ abi: DISTRIBUTOR_ABI, data: log.data, topics: log.topics });
                    if (event.eventName === 'CampaignCreated') { onchainId = Number((event.args as any).id); break; }
                } catch (_e) { }
            }
            setIsCreating(false);

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
                minFollowers: _require200Followers ? 200 : 0,
                requirePro: _requirePro,
                onchainId: onchainId,
                endedAt: endedAt,
            } as any);

            _setCreatedCampaignId(newCampaign.id);
            setShowSuccess(true);
        } catch (error) {
            console.error(error);
            alert('Failed to create campaign');
        } finally {
            setIsSubmitting(false);
            setIsApproving(false);
            setIsCreating(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        _router.push('/');
    };

    const _visibleTokens = _showAllTokens ? SUPPORTED_TOKENS : SUPPORTED_TOKENS.slice(0, 2);

    const getProfileLabel = () => {
        if (category === 'MiniApp') return 'Mini App URL';
        return 'Farcaster Profile URL';
    };

    const getCastLabel = () => 'Cast URL';

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

            <button onClick={() => _router.push('/')} className={styles.backButton}>
                <ArrowLeft size={16} /> Back
            </button>

            <header className={styles.header}>
                <h1>New {platform} Campaign</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
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
                                    onClick={() => handleCategorySelect(cat)}
                                    className={`${styles.categoryBtn} ${isActive ? styles.categoryActive : ''}`}
                                >
                                    <Icon size={20} className={styles.categoryIcon} />
                                    <span className={styles.categoryLabel}>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {category === 'Multi' && (
                    <div className={styles.panel}>
                        <h3>All-in-One Multi Task</h3>
                        <p>Complete all actions and get rewarded!</p>
                    </div>
                )}

                {needsProfileUrl && (
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>{getProfileLabel()}</label>
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
                            required
                        />
                    </div>
                )}

                <div className={styles.budgetCard}>
                    <label className={styles.inputLabel}>SET CAMPAIGN BUDGET</label>
                    <div className={styles.budgetInputContainer}>
                        <input
                            type="number"
                            value={totalBudget}
                            onChange={(e) => setTotalBudget(e.target.value)}
                            placeholder="10"
                            required
                            min="3"
                            className={styles.budgetInput}
                        />
                    </div>
                    <div className={styles.selectorGrid}>
                        {_visibleTokens.map(token => (
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
                    {budgetError && <div className={styles.errorText}>{budgetError}</div>}
                </div>

                <div style={{ marginBottom: '100px' }}>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting || !isFarcasterUser || !isConnected}
                    >
                        {isApproving ? 'Approving...' : isCreating ? 'Creating...' : isSubmitting ? 'Saving...' : `Pay ${totalBudget} ${rewardToken} & Create`}
                    </button>
                </div>
            </form>
        </div>
    );
}
