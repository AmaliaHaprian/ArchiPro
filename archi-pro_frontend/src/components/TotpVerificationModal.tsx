import { useState } from 'react';
import { verifyTotpLogin, verifyBackupCodeLogin } from '../api';
import './TotpVerificationModal.css';

interface TotpVerificationModalProps {
    mfaToken: string;
    onVerificationSuccess: (token: string, user: any) => void;
    onVerificationError: (error: string) => void;
}

function TotpVerificationModal({ mfaToken, onVerificationSuccess, onVerificationError }: TotpVerificationModalProps) {
    const [totpCode, setTotpCode] = useState('');
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [backupCode, setBackupCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTotpVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!totpCode.trim()) {
                setError('TOTP code is required');
                setLoading(false);
                return;
            }

            if (totpCode.length !== 6 || !/^\d+$/.test(totpCode)) {
                setError('TOTP code must be 6 digits');
                setLoading(false);
                return;
            }

            const result = await verifyTotpLogin(mfaToken, totpCode);
            onVerificationSuccess(result.access_token, result.user);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Verification failed';
            setError(errorMessage);
            onVerificationError(errorMessage);
            setLoading(false);
        }
    };

    const handleBackupCodeVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!backupCode.trim()) {
                setError('Backup code is required');
                setLoading(false);
                return;
            }

            const result = await verifyBackupCodeLogin(mfaToken, backupCode);
            onVerificationSuccess(result.access_token, result.user);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Verification failed';
            setError(errorMessage);
            onVerificationError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="totp-verification-modal-overlay">
            <div className="totp-verification-modal">
                <h2>Two-Factor Authentication</h2>
                <p className="modal-subtitle">
                    Enter the 6-digit code from your authenticator app
                </p>

                {error && <div className="error-message">{error}</div>}

                {!useBackupCode ? (
                    <form onSubmit={handleTotpVerification}>
                        <div className="form-group">
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
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="verify-button"
                        >
                            {loading ? 'Verifying...' : 'Verify'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setUseBackupCode(true);
                                setError('');
                            }}
                            disabled={loading}
                            className="backup-code-button"
                        >
                            Use backup code instead
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleBackupCodeVerification}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Enter backup code"
                                value={backupCode}
                                onChange={(e) => setBackupCode(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="verify-button"
                        >
                            {loading ? 'Verifying...' : 'Verify'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setUseBackupCode(false);
                                setError('');
                                setBackupCode('');
                                setTotpCode('');
                            }}
                            disabled={loading}
                            className="backup-code-button"
                        >
                            Back to TOTP
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default TotpVerificationModal;
