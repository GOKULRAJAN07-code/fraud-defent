import React, { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import RiskGauge from './RiskGauge';
import ShapPanel from './ShapPanel';
import { Activity, ShieldAlert, CheckCircle } from 'lucide-react';

// Simple debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const WhatIfSimulator = () => {
    // Default starting point for the sliders
    const [features, setFeatures] = useState({
        amount: 250,
        user_age_days: 365,
        device_trust_score: 0.9,
        velocity_1h: 2,
        distance_from_home: 5
    });

    const [simulationResult, setSimulationResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Debounce the features so we don't spam the API on every slider tick
    const debouncedFeatures = useDebounce(features, 300);

    const runSimulation = useCallback(async (currentFeatures) => {
        setLoading(true);
        try {
            const res = await client.post('/fraud/simulate', currentFeatures);
            setSimulationResult(res.data);
        } catch (err) {
            console.error("Simulation failed", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Re-run simulation when debounced features change
    useEffect(() => {
        runSimulation(debouncedFeatures);
    }, [debouncedFeatures, runSimulation]);

    const handleSliderChange = (e) => {
        const { name, value } = e.target;
        setFeatures(prev => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.2rem' }}>Interactive AI Risk Simulator</h2>
                    {loading && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} className="animate-pulse">Analyzing...</span>}
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                    Drag the sliders below to see how different transaction features shift the AI decision boundary in real-time.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>

                    {/* Controls Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>Amount ($)</label>
                                <span style={{ fontFamily: 'monospace' }}>${features.amount}</span>
                            </div>
                            <input type="range" name="amount" min="1" max="10000" step="10" value={features.amount} onChange={handleSliderChange} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>Velocity (Txns last hour)</label>
                                <span style={{ fontFamily: 'monospace' }}>{features.velocity_1h}/hr</span>
                            </div>
                            <input type="range" name="velocity_1h" min="0" max="30" step="1" value={features.velocity_1h} onChange={handleSliderChange} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>Device Trust Score (0-1)</label>
                                <span style={{ fontFamily: 'monospace' }}>{features.device_trust_score.toFixed(2)}</span>
                            </div>
                            <input type="range" name="device_trust_score" min="0" max="1" step="0.01" value={features.device_trust_score} onChange={handleSliderChange} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>Distance from Home (km)</label>
                                <span style={{ fontFamily: 'monospace' }}>{features.distance_from_home} km</span>
                            </div>
                            <input type="range" name="distance_from_home" min="0" max="5000" step="10" value={features.distance_from_home} onChange={handleSliderChange} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>Account Age (Days)</label>
                                <span style={{ fontFamily: 'monospace' }}>{features.user_age_days} days</span>
                            </div>
                            <input type="range" name="user_age_days" min="0" max="3650" step="1" value={features.user_age_days} onChange={handleSliderChange} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                        </div>
                    </div>

                    {/* Results Column */}
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                        {simulationResult ? (
                            <>
                                <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Simulated Outcome</div>
                                    {simulationResult.is_fraud ? (
                                        <div className="badge badge-danger" style={{ fontSize: '1.2rem', padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                            <ShieldAlert size={20} /> FRAUD (BLOCKED)
                                        </div>
                                    ) : (
                                        <div className="badge badge-success" style={{ fontSize: '1.2rem', padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                            <CheckCircle size={20} /> SAFE (ALLOWED)
                                        </div>
                                    )}
                                </div>
                                <div style={{ width: '100%', maxWidth: '300px' }}>
                                    <RiskGauge score={simulationResult.risk_score} />
                                </div>
                            </>
                        ) : (
                            <Activity size={32} style={{ opacity: 0.2, animation: 'pulse 2s infinite' }} />
                        )}
                    </div>
                </div>
            </div>

            {/* Explainability Row */}
            <div className="glass-panel">
                <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Decision Intelligence (Why did the model choose this?)</h2>
                {simulationResult?.explanations ? (
                    <ShapPanel explanations={simulationResult.explanations} />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                        Awaiting simulation data...
                    </div>
                )}
            </div>

        </div>
    );
};

export default WhatIfSimulator;
