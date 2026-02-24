import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import client from '../api/client';
import RiskGauge from '../components/RiskGauge';
import ShapPanel from '../components/ShapPanel';
import FraudAlert from '../components/FraudAlert';
import WhatIfSimulator from '../components/WhatIfSimulator';
import TransactionForm from '../components/TransactionForm';
import { AlertCircle, CheckCircle, Activity, ShieldAlert, Cpu, Monitor } from 'lucide-react';

const DashboardPage = () => {
    const [activeView, setActiveView] = useState('monitor'); // 'monitor' or 'simulator'
    const [transactions, setTransactions] = useState([]);
    const [activeAlert, setActiveAlert] = useState(null);

    const { data: wsData, isConnected } = useWebSocket('ws://localhost:8000/fraud/stream');

    // Initial load
    useEffect(() => {
        client.get('/fraud/transactions')
            .then(res => {
                if (res.data.transactions) {
                    setTransactions(res.data.transactions);
                }
            })
            .catch(err => console.error("Failed to load initial txs", err));
    }, []);

    // Handle new websocket data
    useEffect(() => {
        if (wsData) {
            if (wsData.action === 'clear') {
                setTransactions([]);
                setActiveAlert(null);
            } else if (wsData.action === 'delete') {
                setTransactions(prev => prev.filter(tx => tx.id !== wsData.id));
            } else if (wsData.id) {
                // New transaction arrived
                setTransactions(prev => [wsData, ...prev]);
                // Trigger alert if fraud
                if (wsData.is_fraud) {
                    setActiveAlert(wsData);
                }
            }
        }
    }, [wsData]);

    const handleDelete = async (txId) => {
        try {
            await client.delete(`/fraud/transactions/${txId}`);
            setTransactions(prev => prev.filter(tx => tx.id !== txId));
        } catch (err) {
            console.error(`Failed to clear transaction ${txId}`, err);
        }
    };

    return (
        <div className="app-container">
            <div className="main-content">

                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                        <h1 className="text-gradient">Real-Time Fraud Monitor</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Streaming synthetic transaction data</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        {/* View Toggle */}
                        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', display: 'flex', padding: '4px' }}>
                            <button
                                onClick={() => setActiveView('monitor')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: activeView === 'monitor' ? 'var(--primary)' : 'transparent',
                                    color: activeView === 'monitor' ? 'white' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
                                }}>
                                <Monitor size={16} /> Live Monitor
                            </button>
                            <button
                                onClick={() => setActiveView('simulator')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: activeView === 'simulator' ? 'var(--primary)' : 'transparent',
                                    color: activeView === 'simulator' ? 'white' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
                                }}>
                                <Cpu size={16} /> What-If Simulator
                            </button>
                        </div>

                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.9rem',
                            color: isConnected ? 'var(--success)' : 'var(--warning)'
                        }}>
                            <span className={`animate-pulse-slow ${isConnected ? 'badge-success' : 'badge-warning'}`} style={{ width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', background: 'currentColor' }} />
                            {isConnected ? 'Stream Active' : 'Connecting...'}
                        </span>
                    </div>
                </header>

                {activeView === 'monitor' ? (
                    <>
                        {/* Top metrics row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px' }}>
                                    <Activity size={24} color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{transactions.length}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Transactions</div>
                                </div>
                            </div>

                            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
                                <div style={{ background: transactions.length > 0 ? (transactions[0].is_fraud ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)') : 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '12px' }}>
                                    {transactions.length > 0 ? (transactions[0].is_fraud ? <ShieldAlert size={24} color="var(--danger)" /> : <CheckCircle size={24} color="var(--success)" />) : <Activity size={24} color="var(--text-muted)" />}
                                </div>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: transactions.length > 0 ? (transactions[0].is_fraud ? 'var(--danger)' : 'var(--success)') : 'var(--text-muted)' }}>
                                        {transactions.length > 0 ? (transactions[0].is_fraud ? 'FRAUD' : 'SAFE') : '-'}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Latest Status</div>
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: '8px' }}>
                                {transactions.length > 0 ? (
                                    <RiskGauge score={transactions[0].risk_score} />
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        Submit Txn for Risk Score
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', flex: 1, marginTop: '24px' }} className="animate-slide-in">

                            {/* Left Column Container */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <TransactionForm />

                                {/* Active Transaction View */}
                                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', maxHeight: '600px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', position: 'sticky', top: 0, background: 'var(--glass-bg)', zIndex: 10, paddingBottom: '8px' }}>
                                        <h2 style={{ fontSize: '1.2rem' }}>Recent Transactions ({transactions.length})</h2>
                                        {transactions.length > 0 && (
                                            <button onClick={() => transactions.forEach(tx => handleDelete(tx.id))} className="btn-clear">
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    {transactions.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {transactions.map((tx) => (
                                                <div key={tx.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} className="hover-highlight">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                                                        <div>
                                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Transaction ID</div>
                                                            <div style={{ fontFamily: 'monospace', fontSize: '1.2rem' }}>{tx.id}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            {tx.is_fraud ? (
                                                                <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1rem', padding: '6px 12px' }}>
                                                                    <AlertCircle size={16} /> FRAUD
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1rem', padding: '6px 12px' }}>
                                                                    <CheckCircle size={16} /> SAFE
                                                                </span>
                                                            )}
                                                            <button onClick={() => handleDelete(tx.id)} className="btn-delete-icon" title="Remove Output">
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                                        <div>
                                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Amount</div>
                                                            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>${tx.features.amount.toFixed(2)}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Time</div>
                                                            <div style={{ fontSize: '1.1rem' }}>{new Date(tx.timestamp).toLocaleTimeString()}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>User ID</div>
                                                            <div style={{ fontSize: '1.1rem' }}>{tx.user_id}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '24px', minHeight: '200px' }}>
                                            <div>
                                                <Activity size={32} style={{ opacity: 0.2, margin: '0 auto 12px', display: 'block' }} />
                                                No transactions currently active. Submit one above.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Explainability Sidebar */}
                            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Decision Intelligence (Latest Txn)</h2>
                                {transactions.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-slide-in">
                                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Transaction Context</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>User ID: {transactions[0].user_id}</div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                                                <div style={{ fontSize: '0.8rem' }}><span style={{ color: 'var(--text-muted)' }}>Age:</span> {transactions[0].features.user_age_days}d</div>
                                                <div style={{ fontSize: '0.8rem' }}><span style={{ color: 'var(--text-muted)' }}>Trust:</span> {transactions[0].features.device_trust_score.toFixed(2)}</div>
                                                <div style={{ fontSize: '0.8rem' }}><span style={{ color: 'var(--text-muted)' }}>Velocity:</span> {transactions[0].features.velocity_1h}/hr</div>
                                                <div style={{ fontSize: '0.8rem' }}><span style={{ color: 'var(--text-muted)' }}>Dist:</span> {transactions[0].features.distance_from_home.toFixed(0)}km</div>
                                            </div>
                                        </div>

                                        <ShapPanel explanations={transactions[0].explanations} />
                                    </div>
                                ) : (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                                        <Activity size={32} style={{ opacity: 0.2, margin: '0 auto 12px', display: 'block' }} />
                                        Submit a transaction to view its AI decision explainability logs.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ marginTop: '24px' }}>
                        <WhatIfSimulator />
                    </div>
                )}
            </div>

            <FraudAlert
                transaction={activeAlert}
                onClose={() => setActiveAlert(null)}
            />
        </div>
    );
};

export default DashboardPage;
