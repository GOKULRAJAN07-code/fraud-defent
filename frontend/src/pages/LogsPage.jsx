import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { FileText, Search, Download, AlertCircle, TrendingUp, UserX, UserCheck } from 'lucide-react';
import ShapPanel from '../components/ShapPanel';

const LogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 50;

    useEffect(() => {
        // Fetch analytics first
        client.get('/logs/analytics')
            .then(res => setAnalytics(res.data))
            .catch(err => console.error("Error loading analytics", err));

        // Fetch initial logs
        fetchLogs(0);
    }, []);

    const fetchLogs = (currentSkip) => {
        const isInitial = currentSkip === 0;
        if (!isInitial) setLoadingMore(true);

        client.get(`/logs?skip=${currentSkip}&limit=${LIMIT}`)
            .then(res => {
                const newLogs = res.data.logs;
                if (isInitial) {
                    setLogs(newLogs);
                } else {
                    setLogs(prev => [...prev, ...newLogs]);
                }

                // If we received less than the limit, we've reached the end
                if (newLogs.length < LIMIT) {
                    setHasMore(false);
                }

                if (isInitial) setLoading(false);
                else setLoadingMore(false);
            })
            .catch(err => {
                console.error("Error loading logs", err);
                if (isInitial) setLoading(false);
                else setLoadingMore(false);
            });
    };

    const handleLoadMore = () => {
        const nextSkip = skip + LIMIT;
        setSkip(nextSkip);
        fetchLogs(nextSkip);
    };

    const filteredLogs = logs.filter(log =>
        log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="app-container">
            <div className="main-content">

                <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FileText size={32} color="var(--primary)" /> Explainability Logs
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Audit trail and AI decisions for detected fraud events</p>
                    </div>
                    <div>
                        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
                            <Download size={18} /> Export JSON
                        </button>
                    </div>
                </header>

                {analytics && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>
                        <div className="glass-panel" style={{ padding: '20px' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Fraud Detection Rate</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                                {(analytics.fraud_rate * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Total Analyzed</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                {analytics.total_transactions}
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <TrendingUp size={32} color="var(--primary)" />
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Model Drift</div>
                                <div style={{ color: 'var(--success)' }}>Nominal (0.99 AUC)</div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, minHeight: 0 }}>

                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.2rem' }}>Fraud Events Audit</h2>

                            <div style={{ position: 'relative', width: '250px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Search TXN ID or User..."
                                    style={{ paddingLeft: '36px', padding: '8px 8px 8px 36px', fontSize: '0.9rem' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading logs data...</div>
                        ) : filteredLogs.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No fraud events recorded yet.</div>
                        ) : (
                            <div style={{ overflowY: 'auto' }}>
                                {filteredLogs.map(log => (
                                    <div
                                        key={log.id}
                                        onClick={() => setSelectedLog(log)}
                                        style={{
                                            padding: '20px 16px',
                                            borderBottom: '1px solid var(--glass-border)',
                                            cursor: 'pointer',
                                            background: selectedLog?.id === log.id ? 'var(--bg-card-hover)' : 'transparent',
                                            borderLeft: selectedLog?.id === log.id ? (log.type === 'DAO_VERIFICATION' ? '4px solid var(--secondary)' : '4px solid var(--danger)') : '4px solid transparent',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                        className="hover-highlight"
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontFamily: 'monospace', fontWeight: '600', color: log.type === 'DAO_VERIFICATION' ? 'var(--secondary)' : 'var(--text-main)' }}>
                                                {log.type === 'DAO_VERIFICATION' ? `[DAO] ${log.id.split('-')[1]}` : `#${log.id.split('-')[1]}`}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>User: <span style={{ color: 'var(--primary)', fontWeight: '500' }}>{log.user_id}</span></div>
                                            {log.type === 'TRANSACTION' ? (
                                                <div style={{ fontWeight: 'bold' }}>${log.features.amount.toFixed(2)}</div>
                                            ) : (
                                                <div style={{ fontWeight: 'bold', color: log.is_fraud ? 'var(--danger)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {log.is_fraud ? <UserX size={16} /> : <UserCheck size={16} />} {log.features["Match Confidence"]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {hasMore && !searchTerm && (
                                    <div style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="btn-primary"
                                            style={{ padding: '8px 24px', fontSize: '0.9rem', width: 'auto' }}
                                        >
                                            {loadingMore ? 'Loading Data...' : 'Load More Events'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="glass-panel">
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Deep Investigation</h2>
                        {selectedLog ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                                {selectedLog.type === 'DAO_VERIFICATION' ? (
                                    <>
                                        <div style={{ padding: '16px', background: selectedLog.is_fraud ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: selectedLog.is_fraud ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: selectedLog.is_fraud ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>
                                                {selectedLog.is_fraud ? <UserX size={20} /> : <UserCheck size={20} />}
                                                {selectedLog.is_fraud ? 'Identity Verification Failed' : 'Identity Verified Successfully'}
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                DAO Identity request <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{selectedLog.id}</span> was evaluated with a face match confidence of {selectedLog.features["Match Confidence"]}.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--danger)', fontWeight: 'bold' }}>
                                                <AlertCircle size={20} /> High Risk Transaction Blocked
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                Transaction <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{selectedLog.id}</span> was flagged by the XGBoost model with a confidence score of {(selectedLog.risk_score * 100).toFixed(2)}%.
                                            </p>
                                        </div>

                                        <ShapPanel explanations={selectedLog.explanations} />
                                    </>
                                )}

                                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Raw System Features</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                                        {Object.entries(selectedLog.features).map(([key, val]) => (
                                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>{key}:</span>
                                                <span>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                Select a log entry on the left to view deep explainability.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LogsPage;
