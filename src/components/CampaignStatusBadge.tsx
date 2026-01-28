import React from 'react';

interface CampaignStatusBadgeProps {
    isEnded: boolean;
}

export const CampaignStatusBadge: React.FC<CampaignStatusBadgeProps> = ({ isEnded }) => {
    if (isEnded) {
        return (
            <span style={{
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(231, 15, 15, 0.2)',
                color: '#ff6b6b',
                border: '1px solid rgba(231, 15, 15, 0.4)',
                fontWeight: 600
            }}>
                ENDED
            </span>
        );
    }

    return (
        <span style={{
            fontSize: '0.7rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            background: 'rgba(46, 204, 113, 0.2)',
            color: '#2ecc71',
            border: '1px solid rgba(46, 204, 113, 0.4)',
            fontWeight: 600
        }}>
            ACTIVE
        </span>
    );
};
