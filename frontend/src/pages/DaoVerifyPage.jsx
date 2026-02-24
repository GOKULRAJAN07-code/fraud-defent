import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import client from '../api/client';
import { Camera, UploadCloud, Shield, CheckCircle, XCircle } from 'lucide-react';

const DaoVerifyPage = () => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [idFile, setIdFile] = useState(null);
    const [fullname, setFullname] = useState('');
    const [dob, setDob] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef, setImgSrc]);

    const retake = () => setImgSrc(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setIdFile(e.target.files[0]);
        }
    };

    const urltoFile = (dataurl, filename, mimeType) => {
        return (fetch(dataurl)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
        );
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!imgSrc || !idFile || !fullname || !dob) {
            setError("Please fill out all fields, capture a photo, and upload an ID.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const cameraFile = await urltoFile(imgSrc, 'camera.jpg', 'image/jpeg');

            const formData = new FormData();
            formData.append('camera_image', cameraFile);
            formData.append('id_image', idFile);
            formData.append('fullname', fullname);
            formData.append('dob', dob);

            const res = await client.post('/dao/verify', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Verification failed due to a server error.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container">
            <div className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>

                <header style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <Shield size={48} className="text-gradient-primary animate-pulse-slow" style={{ margin: '0 auto 16px' }} />
                    <h1 className="text-gradient">DAO Identity Verification</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Securely link your real-world identity to a Blockchain DID using AI Face Matching</p>
                </header>

                {error && (
                    <div className="badge badge-danger" style={{ display: 'block', padding: '16px', fontSize: '1rem', marginBottom: '24px' }}>
                        {error}
                    </div>
                )}

                {result && (
                    <div className={`glass-panel animate-slide-in`} style={{
                        marginBottom: '24px',
                        border: `1px solid ${result.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                        background: result.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                    }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: result.status === 'APPROVED' ? 'var(--success)' : 'var(--danger)' }}>
                            {result.status === 'APPROVED' ? <CheckCircle /> : <XCircle />}
                            {result.message}
                        </h2>

                        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>AI Match Confidence</span>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(result.match_score * 100).toFixed(1)}%</div>
                            </div>

                            {result.blockchain_did && (
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Blockchain Identity Hash (DID)</span>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--primary)', wordBreak: 'break-all' }}>
                                        {result.blockchain_did}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="btn-primary" style={{ marginTop: '24px' }} onClick={() => { setResult(null); setImgSrc(null); setIdFile(null); }}>
                            Verify Another Identity
                        </button>
                    </div>
                )}

                {!result && (
                    <form onSubmit={handleVerify} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

                        {/* Left Column: Data & ID Upload */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="glass-panel">
                                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Personal Information</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label className="input-label">Full Legal Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={fullname}
                                            onChange={(e) => setFullname(e.target.value)}
                                            placeholder="e.g. Satoshi Nakamoto"
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel">
                                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Government ID Upload</h3>
                                <label style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '32px',
                                    border: '2px dashed rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: idFile ? 'var(--primary)' : 'var(--text-muted)'
                                }}>
                                    <UploadCloud size={32} style={{ marginBottom: '8px' }} />
                                    {idFile ? idFile.name : 'Click to select ID image'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Right Column: Live Camera Proof */}
                        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Liveness Camera Proof</h3>

                            <div style={{ flex: 1, position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000', minHeight: '300px' }}>
                                {imgSrc ? (
                                    <img src={imgSrc} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{ facingMode: "user" }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                {imgSrc ? (
                                    <button type="button" onClick={retake} className="btn-danger" style={{ flex: 1 }}>
                                        Retake Photo
                                    </button>
                                ) : (
                                    <button type="button" onClick={capture} className="btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <Camera size={20} /> Capture Face
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Submit full form */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing AI Verification...' : 'Verify & Mint Blockchain ID'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default DaoVerifyPage;
