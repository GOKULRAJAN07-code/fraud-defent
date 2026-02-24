import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Shield, FileText, LogOut, Code } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav style={{
            width: '260px',
            background: 'rgba(15, 17, 26, 0.95)',
            borderRight: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px'
        }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                <Shield size={28} className="text-gradient-primary" />
                <div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }} className="text-gradient">DefendID</h2>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Security Suite</div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <NavLink
                    to="/dashboard"
                    style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive ? 'white' : 'var(--text-muted)',
                        background: isActive ? 'var(--primary-glow)' : 'transparent',
                        border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                        transition: 'all 0.2s',
                        fontWeight: isActive ? '600' : '400'
                    })}
                >
                    <LayoutDashboard size={20} /> Dashboard
                </NavLink>

                <NavLink
                    to="/dao"
                    style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive ? 'white' : 'var(--text-muted)',
                        background: isActive ? 'var(--primary-glow)' : 'transparent',
                        border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                        transition: 'all 0.2s',
                        fontWeight: isActive ? '600' : '400'
                    })}
                >
                    <Code size={20} /> DAO Verification
                </NavLink>

                <NavLink
                    to="/logs"
                    style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive ? 'white' : 'var(--text-muted)',
                        background: isActive ? 'var(--primary-glow)' : 'transparent',
                        border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                        transition: 'all 0.2s',
                        fontWeight: isActive ? '600' : '400'
                    })}
                >
                    <FileText size={20} /> Audit Logs
                </NavLink>
            </div>

            <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{user.username}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{user.role}</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'transparent', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center'
                        }}
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

        </nav>
    );
};

export default Navbar;
