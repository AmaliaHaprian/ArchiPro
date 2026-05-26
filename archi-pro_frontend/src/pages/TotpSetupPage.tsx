import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateTotpSecret, verifyTotpSetup } from '../api';
import { AuthContext } from '../components/AuthContext';
import './TotpSetupPage.css';

function TotpSetupPage() {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [stage, setStage] = useState<'generating' | 'displaying' | 'verifying' | 'complete'>('generating');
    const [secret, setSecret] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [totpCode, setTotpCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [backupCodesCopied, setBackupCodesCopied] = useState(false);

    if (!auth || !auth.user) {
        return <div>Please log in to set up TOTP</div>;
    }

    const handleGenerateSecret = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await generateTotpSecret();
            setSecret(response.secret);
            setQrCode(response.qrCode);
            setBackupCodes(response.backupCodes);
            setStage('displaying');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate TOTP secret');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyTotp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!totpCode.trim() || totpCode.length !== 6 || !/^\d+$/.test(totpCode)) {
                setError('TOTP code must be 6 digits');
                setLoading(false);
                return;
            }

            await verifyTotpSetup(totpCode, backupCodes);
            setStage('complete');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to verify TOTP');
            setLoading(false);
        }
    };

    const copyBackupCodes = () => {
        const text = backupCodes.join('\n');
        navigator.clipboard.writeText(text).then(() => {
            setBackupCodesCopied(true);
            setTimeout(() => setBackupCodesCopied(false), 2000);
        });
    };

    const downloadBackupCodes = () => {
        const text = `TOTP Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}`;
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', 'backup-codes.txt');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="totp-setup-page">
            <div className="totp-setup-container">
                <h1>Set Up Two-Factor Authentication</h1>

                {error && <div className="error-banner">{error}</div>}

                {stage === 'generating' && (
                    <div className="stage-content">
                        <p>Secure your account by enabling two-factor authentication with an authenticator app.</p>
                        <button onClick={handleGenerateSecret} disabled={loading} className="primary-button">
                            {loading ? 'Generating...' : 'Start Setup'}
                        </button>
                    </div>
                )}

                {stage === 'displaying' && (
                    <div className="stage-content">
                        <div className="setup-steps">
                            <h2>Step 1: Scan QR Code</h2>
                            <p>Scan this QR code with Microsoft Authenticator or your preferred authenticator app:</p>
                            {qrCode && (
                                <div className="qr-code-container">
                                    <img src={qrCode} alt="TOTP QR Code" />
                                </div>
                            )}

                            <div className="manual-entry">
                                <p><strong>Or manually enter this key:</strong></p>
                                <code className="secret-code">{secret}</code>
                            </div>

                            <h2>Step 2: Save Backup Codes</h2>
                            <p>Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator app.</p>
                            <div className="backup-codes">
                                {backupCodes.map((code, index) => (
                                    <div key={index} className="backup-code-item">
                                        {code}
                                    </div>
                                ))}
                            </div>
                            <div className="backup-actions">
                                <button onClick={copyBackupCodes} className="secondary-button">
                                    {backupCodesCopied ? 'Copied!' : 'Copy Codes'}
                                </button>
                                <button onClick={downloadBackupCodes} className="secondary-button">
                                    Download Codes
                                </button>
                            </div>

                            <button
                                onClick={() => setStage('verifying')}
                                className="primary-button"
                                style={{ marginTop: '20px' }}
                            >
                                Next: Verify Setup
                            </button>
                        </div>
                    </div>
                )}

                {stage === 'verifying' && (
                    <div className="stage-content">
                        <h2>Step 3: Verify Authentication Code</h2>
                        <p>Enter the 6-digit code from your authenticator app to verify setup:</p>
                        <form onSubmit={handleVerifyTotp}>
                            <input
                                type="text"
                                placeholder="000000"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                disabled={loading}
                                autoFocus
                                className="totp-input"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="primary-button"
                                style={{ marginTop: '15px' }}
                            >
                                {loading ? 'Verifying...' : 'Verify & Enable'}
                            </button>
                        </form>
                        <button
                            onClick={() => setStage('displaying')}
                            disabled={loading}
                            className="back-button"
                        >
                            Back
                        </button>
                    </div>
                )}

                {stage === 'complete' && (
                    <div className="stage-content success">
                        <div className="success-icon">✓</div>
                        <h2>Two-Factor Authentication Enabled!</h2>
                        <p>Your account is now protected with two-factor authentication. You'll need to enter a code from your authenticator app each time you log in.</p>
                        <div className="setup-actions">
                            <button
                                onClick={() => navigate('/security/webauthn-setup')}
                                className="primary-button"
                            >
                                Continue to Face ID / Passkey setup
                            </button>
                            <button
                                onClick={() => navigate('/overview')}
                                className="secondary-button"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TotpSetupPage;
