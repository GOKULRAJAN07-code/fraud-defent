import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Lock, User } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const success = await login(username, password);

        if (success) {
            navigate('/dashboard');
        } else {
            setError('Invalid credentials. Hint: use admin/admin or analyst/analyst');
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel animate-slide-in" style={{ width: '100%', maxWidth: '420px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <ShieldCheck size={48} className="text-gradient-primary animate-pulse-slow" style={{ margin: '0 auto 16px' }} />
                    <h2 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                        Identity Defense
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>Sign in to access the control panel</p>
                </div>

                {error && (
                    <div className="badge badge-danger" style={{ display: 'block', textAlign: 'center', marginBottom: '24px', padding: '12px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label className="input-label">Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: '44px' }}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '44px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '8px' }} disabled={isLoading}>
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <p>Demo Accounts:</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>admin / admin</span>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>analyst / analyst</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
