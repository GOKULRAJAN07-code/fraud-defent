import React, { useState } from 'react';
import client from '../api/client';
import { Send } from 'lucide-react';

const TransactionForm = () => {
    const [formData, setFormData] = useState({
        user_id: 'user_' + Math.floor(1000 + Math.random() * 9000),
        amount: 150.0,
        user_age_days: 100,
        device_trust_score: 0.95,
        velocity_1h: 1,
        distance_from_home: 10.0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'user_id' ? value : Number(value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await client.post('/fraud/transactions', {
                user_id: formData.user_id,
                features: {
                    amount: formData.amount,
                    user_age_days: formData.user_age_days,
                    device_trust_score: formData.device_trust_score,
                    velocity_1h: formData.velocity_1h,
                    distance_from_home: formData.distance_from_home
                }
            });
            // Optionally randomize next transaction slightly
            setFormData(prev => ({
                ...prev,
                user_id: 'user_' + Math.floor(1000 + Math.random() * 9000),
            }));
        } catch (err) {
            console.error("Failed to submit transaction", err);
            setError(err.response?.data?.detail || "Failed to submit transaction.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Manual Transaction Entry</h2>

            {error && <div className="badge badge-danger" style={{ marginBottom: '16px', display: 'block' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                    <label className="input-label">User ID</label>
                    <input type="text" className="input-field" name="user_id" value={formData.user_id} onChange={handleChange} required />
                </div>
                <div>
                    <label className="input-label">Amount ($)</label>
                    <input type="number" step="0.01" className="input-field" name="amount" value={formData.amount} onChange={handleChange} required />
                </div>
                <div>
                    <label className="input-label">User Age (Days)</label>
                    <input type="number" className="input-field" name="user_age_days" value={formData.user_age_days} onChange={handleChange} required />
                </div>
                <div>
                    <label className="input-label">Device Trust (0-1)</label>
                    <input type="number" step="0.01" min="0" max="1" className="input-field" name="device_trust_score" value={formData.device_trust_score} onChange={handleChange} required />
                </div>
                <div>
                    <label className="input-label">Velocity (1h)</label>
                    <input type="number" className="input-field" name="velocity_1h" value={formData.velocity_1h} onChange={handleChange} required />
                </div>
                <div>
                    <label className="input-label">Distance from Home (km)</label>
                    <input type="number" step="0.1" className="input-field" name="distance_from_home" value={formData.distance_from_home} onChange={handleChange} required />
                </div>

                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {loading ? 'Processing...' : <><Send size={16} /> Submit Transaction</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;
