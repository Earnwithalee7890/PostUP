'use client';

import { useParams } from 'next/navigation';
import { useCampaign, useCampaignSubmissions, useVerifyScreenshot } from '@/hooks/useCampaigns';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { Loader2, ArrowLeft, ExternalLink, Image as ImageIcon, CheckCircle, XCircle, Copy, Trash2 } from 'lucide-react';
import { SupabaseService } from '@/lib/supabaseService';
import Link from 'next/link';
import { useState } from 'react';

import { isAdmin } from '@/lib/admin';
import { useAccount, useWriteContract, useConfig } from 'wagmi';
import { calculateWeightedDistribution } from '@/lib/distribution';
import { generateMerkleDistribution } from '@/lib/merkle';
import { DISTRIBUTOR_ADDRESS } from '@/lib/config';
import { DISTRIBUTOR_ABI } from '@/lib/abi';
import { useFinalizeCampaign } from '@/hooks/useCampaigns';
import { waitForTransactionReceipt } from 'viem/actions';

export default function CampaignSubmissionsPage() {
    const { id } = useParams() as { id: string };
    const { data: campaign, isLoading: loadingCampaign } = useCampaign(id);
    const { data: submissions, isLoading: loadingSubmissions, refetch: refetchSubmissions } = useCampaignSubmissions(id);
    const { mutateAsync: verifyScreenshot } = useVerifyScreenshot();
    const { mutateAsync: finalizeCampaignDb } = useFinalizeCampaign();
    const { context } = useFarcasterContext();
    const { address } = useAccount();
    const { writeContractAsync: writeSetRoot } = useWriteContract();
    const wagmiConfig = useConfig();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isFinalizing, setIsFinalizing] = useState(false);

    const isUserAdmin = isAdmin(address, context?.user?.fid);

    if (!isUserAdmin) {
        return (
            <div className="flex-center full-screen" style={{ flexDirection: 'column', gap: '1rem' }}>
                <h2>🚫 Access Denied</h2>
                <p style={{ color: 'var(--muted-foreground)' }}>Only admins can view submissions.</p>
                <Link href="/campaigns" className="glass-button">Back to Campaigns</Link>
            </div>
        );
    }

    if (loadingCampaign || loadingSubmissions) return <div className="flex-center full-screen"><Loader2 className="spin" /></div>;
    if (!campaign) return <div className="flex-center full-screen">Campaign not found</div>;

    const allSubmissions = submissions || [];

    // Group submissions by user FID
    const submissionsByUser = allSubmissions.reduce((acc: Record<number, any[]>, sub: any) => {
        if (!acc[sub.user_fid]) acc[sub.user_fid] = [];
        acc[sub.user_fid].push(sub);
        return acc;
    }, {});

    const userFids = Object.keys(submissionsByUser).map(Number);

    const approvedUsers = userFids.filter(fid => {
        const userSubs = submissionsByUser[fid];
        // For simple distribution, consider user approved if at least one task is approved
        // Or strictly if all are approved? Let's go with all approved for this campaign type.
        return userSubs.every((s: any) => s.status === 'approved');
    });

    const handleFinalize = async () => {
        if (!campaign || approvedUsers.length === 0) {
            alert('No approved participants to pay.');
            return;
        }

        if (!confirm(`Finalize campaign and distribute rewards to ${approvedUsers.length} users?`)) return;

        setIsFinalizing(true);
        try {
            // 1. Prepare data for distribution
            const participants = approvedUsers.map(fid => {
                const sub = submissionsByUser[fid][0];
                return {
                    address: sub.user_address,
                    fid,
                    qualityScore: {
                        score: 1.0,
                        tier: 'low' as any,
                        breakdown: {
                            base: 1.0, ageBonus: 0, followerBonus: 0, verifiedBonus: 0,
                            ethActivityBonus: 0, taskHistoryBonus: 0, spamFreeBonus: 0
                        }
                    }
                };
            });

            // 2. Generate Merkle Root
            const distribution = calculateWeightedDistribution(participants, campaign.totalBudget, 0); // 0 fee here because it was paid upfront
            const { root, claims } = generateMerkleDistribution(distribution.claims);

            // 3. Update Smart Contract
            const hash = await writeSetRoot({
                address: DISTRIBUTOR_ADDRESS as `0x${string}`,
                abi: DISTRIBUTOR_ABI,
                functionName: 'setMerkleRoot',
                args: [BigInt(campaign.id), root as `0x${string}`],
            });

            // Wait for tx
            await waitForTransactionReceipt(wagmiConfig as any, { hash });

            // 4. Update Database
            await finalizeCampaignDb({
                campaignId: campaign.id,
                merkleRoot: root,
                totalWeight: distribution.totalWeight
            });

            alert('Campaign finalized! Participants can now claim their rewards. 🎉');
            window.location.reload();

        } catch (error: any) {
            console.error('Finalization error:', error);
            alert(`Finalization failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsFinalizing(false);
        }
    };

    return (
        <main className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/campaigns" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--muted-foreground)',
                    textDecoration: 'none',
                    marginBottom: '1rem'
                }}>
                    <ArrowLeft size={16} /> Back to Campaigns
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                            Submissions
                        </h1>
                        <p style={{ color: 'var(--muted-foreground)' }}>
                            {campaign.category} Campaign on {campaign.platform}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {campaign.status !== 'claimable' && userFids.length > 0 && (
                            <button
                                onClick={handleFinalize}
                                disabled={isFinalizing || approvedUsers.length === 0}
                                className="glass-button"
                                style={{
                                    background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 700,
                                    opacity: (isFinalizing || approvedUsers.length === 0) ? 0.5 : 1
                                }}
                            >
                                {isFinalizing ? <Loader2 className="spin" /> : `Finalize & Pay (${approvedUsers.length})`}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                const list = approvedUsers.map(fid => submissionsByUser[fid][0].user_address).filter(Boolean).join(', ');
                                navigator.clipboard.writeText(list);
                                alert(`Copied ${approvedUsers.length} addresses to clipboard!`);
                            }}
                            className="glass-button"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                        >
                            <Copy size={16} /> Copy All Addresses
                        </button>
                        <button
                            onClick={async () => {
                                if (confirm('Are you sure you want to delete all campaigns not created today? This cannot be undone.')) {
                                    try {
                                        await SupabaseService.cleanupOldCampaigns();
                                        alert('Cleanup successful! 🎉');
                                        window.location.reload();
                                    } catch (err) {
                                        alert('Cleanup failed. Check console.');
                                    }
                                }
                            }}
                            className="glass-button"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#e74c3c', color: '#e74c3c' }}
                        >
                            <Trash2 size={16} /> Cleanup Old
                        </button>
                        <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                            <span style={{ fontWeight: 600 }}>{allSubmissions.length}</span> Total Submissions from <span style={{ fontWeight: 600 }}>{userFids.length}</span> Users
                        </div>
                    </div>
                </div>
            </div>

            {userFids.length === 0 ? (
                <div className="glass-panel flex-center" style={{ padding: '4rem 1rem', flexDirection: 'column', gap: '1rem' }}>
                    <ImageIcon size={48} style={{ opacity: 0.3 }} />
                    <p style={{ color: 'var(--muted-foreground)' }}>No proof submissions yet.</p>
                </div>
            ) : (
                <div className="grid" style={{ gap: '1.5rem' }}>
                    {userFids.map((fid) => {
                        const userSubs = submissionsByUser[fid];
                        const firstSub = userSubs[0];
                        return (
                            <div key={fid} className="glass-panel" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <div style={{
                                            width: 32, height: 32,
                                            borderRadius: '50%',
                                            background: 'var(--primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>
                                            {fid.toString().slice(0, 2)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>FID: {fid}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                {firstSub.user_address?.slice(0, 6)}...{firstSub.user_address?.slice(-4)}
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(firstSub.user_address || '');
                                                        alert('Address copied!');
                                                    }}
                                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                                                    title="Copy Address"
                                                >
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {userSubs.map((sub: any) => (
                                        <div key={sub.id}>
                                            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{sub.task_id}</span>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '4px',
                                                    background: sub.status === 'approved' ? 'rgba(46,204,113,0.2)' : sub.status === 'rejected' ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.1)',
                                                    color: sub.status === 'approved' ? '#2ecc71' : sub.status === 'rejected' ? '#e74c3c' : 'var(--muted-foreground)'
                                                }}>
                                                    {sub.status}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    position: 'relative',
                                                    aspectRatio: '16/9',
                                                    background: 'black',
                                                    borderRadius: '0.5rem',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    border: '1px solid var(--border)'
                                                }}
                                                onClick={() => setSelectedImage(sub.screenshot_url)}
                                            >
                                                <img
                                                    src={sub.screenshot_url}
                                                    alt={`${sub.task_id} proof`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            {sub.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                    <button
                                                        onClick={() => verifyScreenshot({ campaignId: id, userFid: fid, taskId: sub.task_id, status: 'approved' }).then(() => refetchSubmissions())}
                                                        style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: 'none', background: '#2ecc71', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => verifyScreenshot({ campaignId: id, userFid: fid, taskId: sub.task_id, status: 'rejected' }).then(() => refetchSubmissions())}
                                                        style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: 'none', background: '#e74c3c', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 100,
                        background: 'rgba(0,0,0,0.9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '2rem'
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Full size proof"
                        style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '0.5rem' }}
                    />
                    <button
                        style={{
                            position: 'absolute', top: '1rem', right: '1rem',
                            background: 'white', color: 'black',
                            border: 'none', borderRadius: '50%',
                            width: 36, height: 36,
                            cursor: 'pointer', fontWeight: 'bold'
                        }}
                        onClick={() => setSelectedImage(null)}
                    >
                        ✕
                    </button>
                </div>
            )}
        </main>
    );
}

