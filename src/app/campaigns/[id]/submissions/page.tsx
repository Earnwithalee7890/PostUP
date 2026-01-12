'use client';

import { useParams } from 'next/navigation';
import { useCampaign, useCampaignParticipants } from '@/hooks/useCampaigns';
import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { Loader2, ArrowLeft, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Link as HomeLink } from 'lucide-react'; // Avoid conflict with next/link
import { isAdmin } from '@/lib/admin';
import { useAccount } from 'wagmi';

export default function CampaignSubmissionsPage() {
    const { id } = useParams() as { id: string };
    const { data: campaign, isLoading: loadingCampaign } = useCampaign(id);
    const { data: participants, isLoading: loadingParticipants } = useCampaignParticipants(id);
    const { context } = useFarcasterContext();
    const { address } = useAccount();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

    if (loadingCampaign || loadingParticipants) return <div className="flex-center full-screen"><Loader2 className="spin" /></div>;
    if (!campaign) return <div className="flex-center full-screen">Campaign not found</div>;

    // Filter participants who have submitted screenshots
    const submittedParticipants = participants?.filter(p => p.screenshots && Object.keys(p.screenshots).length > 0) || [];

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
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                        <span style={{ fontWeight: 600 }}>{submittedParticipants.length}</span> Submissions
                    </div>
                </div>
            </div>

            {submittedParticipants.length === 0 ? (
                <div className="glass-panel flex-center" style={{ padding: '4rem 1rem', flexDirection: 'column', gap: '1rem' }}>
                    <ImageIcon size={48} style={{ opacity: 0.3 }} />
                    <p style={{ color: 'var(--muted-foreground)' }}>No proof submissions yet.</p>
                </div>
            ) : (
                <div className="grid" style={{ gap: '1.5rem' }}>
                    {submittedParticipants.map((participant) => (
                        <div key={participant.fid} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: 32, height: 32,
                                        borderRadius: '50%',
                                        background: 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.8rem', fontWeight: 'bold'
                                    }}>
                                        {participant.fid.toString().slice(0, 2)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>FID: {participant.fid}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                            Joined {new Date(participant.joinedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                                {Object.entries(participant.screenshots || {}).map(([task, url]) => (
                                    <div key={task}>
                                        <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>{task}</div>
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
                                            onClick={() => setSelectedImage(url)}
                                        >
                                            <img
                                                src={url}
                                                alt={`${task} proof`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
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
