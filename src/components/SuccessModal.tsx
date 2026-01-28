'use client';

import { useFarcasterContext } from '@/providers/FarcasterProvider';
import { Check, X } from 'lucide-react';
import styles from './SuccessModal.module.css';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function SuccessModal({ isOpen, onClose, title, message, actionLabel, onAction }: SuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className={styles.modal}>
                <div className={styles.iconWrapper}>
                    <Check size={32} color="white" strokeWidth={3} />
                </div>

                <h2 className={styles.title} id="modal-title">{title}</h2>
                <p className={styles.message}>{message}</p>

                <div className={styles.actions}>
                    {actionLabel && onAction && (
                        <button onClick={onAction} className={styles.primaryBtn}>
                            {actionLabel}
                        </button>
                    )}
                    <button onClick={onClose} className={styles.secondaryBtn}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
