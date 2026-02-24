import React from 'react';

const ShapPanel = ({ explanations }) => {
    if (!explanations || explanations.length === 0) {
        return (
            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)'
                }}
            >
                Select a transaction to view explainability logs.
            </div>
        );
    }

    // Sort by absolute contribution to find the max for scaling the bars
    const maxContrib = Math.max(...explanations.map(e => Math.abs(e.contribution)));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Why was this decision made? (SHAP Explainability)
            </h3>

            {explanations.slice(0, 5).map((exp, idx) => {
                const isPositive = exp.contribution > 0;
                // Scale width: 5% minimum so it's always visible, up to 100% relative to the max contribution
                const width = Math.max(5, (Math.abs(exp.contribution) / maxContrib) * 100);

                // Colors: Red for pushing towards Fraud, Blue/Green for pushing towards Safe
                const barColor = isPositive ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)';

                return (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 60px', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {exp.feature}
                        </div>

                        <div style={{
                            height: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '4px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                // If it pushes towards fraud, anchor to the left. If safe, anchor differently (for simplicity, we just color code it here)
                                left: 0,
                                width: `${width}%`,
                                background: barColor,
                                borderRadius: '4px'
                            }} />
                        </div>

                        <div style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            {exp.value.toFixed(2)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ShapPanel;
