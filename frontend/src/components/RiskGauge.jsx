import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RiskGauge = ({ score }) => {
    // Score is 0.0 to 1.0 (prob of fraud)
    const normalizedScore = score * 100;

    const data = [
        { name: 'Risk', value: normalizedScore },
        { name: 'Safe', value: 100 - normalizedScore },
    ];

    let color = '#10b981'; // green
    if (normalizedScore > 50) color = '#f59e0b'; // yellow
    if (normalizedScore > 80) color = '#ef4444'; // red

    return (
        <div style={{ position: 'relative', height: '180px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                    >
                        <Cell key="cell-0" fill={color} />
                        <Cell key="cell-1" fill="rgba(255,255,255,0.05)" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div style={{
                position: 'absolute',
                bottom: '10px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color }}>
                    {normalizedScore.toFixed(0)}%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Risk Score
                </div>
            </div>
        </div>
    );
};

export default RiskGauge;
