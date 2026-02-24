import React, { useEffect, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

const FraudAlert = ({ transaction, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (transaction) {
            setVisible(true);
            // Auto dismiss after 5 seconds
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [transaction]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Wait for exit animation
    };

    if (!transaction) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                background: 'rgba(239, 68, 68, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                color: 'white',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                width: '320px',
                zIndex: 1000,
                transform: visible ? 'translateY(0)' : 'translateY(150%)',
                opacity: visible ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
        >
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
                <ShieldAlert size={20} />
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Fraud Detected
                    <button
                        onClick={handleClose}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0 }}
                    >
                        <X size={16} />
                    </button>
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>
                    High-risk transaction (<span style={{ fontFamily: 'monospace' }}>{transaction.id.split('-')[1]}</span>) blocked for User {transaction.user_id}.
                </p>
                <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Risk Score: {(transaction.risk_score * 100).toFixed(0)}%
                </div>
            </div>
        </div>
    );
};

export default FraudAlert;
