import React from 'react';

interface LoadingSpinnerProps {
    size?: number;
    color?: string;
    className?: string;
}

/**
 * A reusable SVG loading spinner component.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 24,
    color = "currentColor",
    className = ""
}) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke={color}
            >
                <style>{`
                    .spinner_PmsL{animation:spinner_z69z 1s linear infinite}
                    .spinner_X67m{animation:spinner_z69z 1s linear infinite;animation-delay:.1s}
                    .spinner_39m7{animation:spinner_z69z 1s linear infinite;animation-delay:.2s}
                    @keyframes spinner_z69z{to{transform:rotate(360deg)}}
                `}</style>
                <path
                    d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                    strokeWidth="0.5"
                    opacity=".25"
                />
                <path
                    d="M12,4a8,8,0,0,1,7.89,6.7"
                    className="spinner_PmsL"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

export default LoadingSpinner;
