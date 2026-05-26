import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startRegistration } from '@simplewebauthn/browser';
import { generateWebAuthnSetupOptions, verifyWebAuthnSetup } from '../api';
import './WebAuthnSetupPage.css';

function WebAuthnSetupPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stage, setStage] = useState<'idle' | 'registering' | 'complete'>('idle');
    const [message, setMessage] = useState('');

    const handleStartSetup = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            setStage('registering');
            setMessage('Preparing Face ID / passkey registration...');
            const setup = await generateWebAuthnSetupOptions();
            const credential = await startRegistration(setup.options as any);
            await verifyWebAuthnSetup(setup.challengeToken, credential);
            setStage('complete');
            setMessage('Face ID / passkey enabled successfully.');
        } catch (err) {
            setStage('idle');
            setError(err instanceof Error ? err.message : 'WebAuthn setup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="webauthn-setup-page">
            <div className="webauthn-setup-card">
                <p className="eyebrow">Factor 3 of 3</p>
                <h1>Enable Face ID / Passkey</h1>
                <p className="description">
                    Register a platform authenticator so your third authentication step uses Face ID, Touch ID,
                    Windows Hello, or a device passkey.
                </p>

                {error && <div className="error-banner">{error}</div>}
                {message && <div className={stage === 'complete' ? 'success-banner' : 'info-banner'}>{message}</div>}

                {stage !== 'complete' ? (
                    <div className="setup-actions">
                        <button className="primary-button" onClick={handleStartSetup} disabled={loading}>
                            {loading ? 'Setting up...' : 'Enable Face ID / Passkey'}
                        </button>
                        <button className="secondary-button" onClick={() => navigate('/security/totp-setup')} disabled={loading}>
                            Back to TOTP setup
                        </button>
                    </div>
                ) : (
                    <div className="complete-actions">
                        <button className="primary-button" onClick={() => navigate('/overview')}>
                            Continue to dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WebAuthnSetupPage;
