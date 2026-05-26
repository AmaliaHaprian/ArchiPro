import { useEffect, useRef, useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { verifyTotpLogin, verifyBackupCodeLogin, verifyWebAuthnLogin } from '../api';
import type { MfaRequiredPayload } from '../models/User';
import './TotpVerificationModal.css';

interface TotpVerificationModalProps {
    mfaToken: string;
    mfaType: 'totp' | 'webauthn';
    webauthnOptions?: Record<string, unknown>;
    onVerificationSuccess: (token: string, user: any) => void;
    onVerificationError: (error: string) => void;
}

function TotpVerificationModal({ mfaToken, mfaType, webauthnOptions, onVerificationSuccess, onVerificationError }: TotpVerificationModalProps) {
    const [totpCode, setTotpCode] = useState('');
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [backupCode, setBackupCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState<'totp' | 'webauthn'>(mfaType);
    const [currentMfaToken, setCurrentMfaToken] = useState(mfaToken);
    const [currentWebAuthnOptions, setCurrentWebAuthnOptions] = useState<Record<string, unknown> | undefined>(webauthnOptions);
    const webAuthnStarted = useRef(false);

    useEffect(() => {
        setCurrentStep(mfaType);
        setCurrentMfaToken(mfaToken);
        setCurrentWebAuthnOptions(webauthnOptions);
        webAuthnStarted.current = false;
    }, [mfaType, mfaToken, webauthnOptions]);

    useEffect(() => {
        if (currentStep !== 'webauthn' || !currentWebAuthnOptions || webAuthnStarted.current) {
            return;
        }

        webAuthnStarted.current = true;
        void handleWebAuthnVerification(currentMfaToken, currentWebAuthnOptions);
    }, [currentStep, currentWebAuthnOptions, currentMfaToken]);

    const handleWebAuthnVerification = async (token: string, options: Record<string, unknown>) => {
        try {
            setLoading(true);
            setError('');
            const assertionResponse = await startAuthentication(options as any);
            console.log('assertionResponse', assertionResponse);
            const result = await verifyWebAuthnLogin(token, assertionResponse);
            console.log('verifyWebAuthnLogin result', result);
            // Only call success if we actually received final auth payload
            if ((result as any)?.access_token && (result as any)?.user) {
                console.log('TOTP verification final payload', { access_token: (result as any).access_token, user: (result as any).user });
                onVerificationSuccess((result as any).access_token, (result as any).user);
            } else {
                console.log('TOTP verification returned MFA challenge, not final auth payload', result);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'WebAuthn verification failed';
            setError(errorMessage);
            onVerificationError(errorMessage);
            setLoading(false);
        }
    };

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

            if ('mfa_required' in result && result.mfa_required) {
                const mfaResult = result as unknown as MfaRequiredPayload;
                console.log('handleTotpVerification received MFA challenge', mfaResult);

                if (mfaResult.mfa_type === 'webauthn' && mfaResult.webauthn_options) {
                    setCurrentStep('webauthn');
                    setCurrentMfaToken(mfaResult.mfa_token);
                    setCurrentWebAuthnOptions(mfaResult.webauthn_options);
                    webAuthnStarted.current = true;
                    setLoading(false);
                    void handleWebAuthnVerification(mfaResult.mfa_token, mfaResult.webauthn_options);
                    return;
                }

                setLoading(false);
                webAuthnStarted.current = false;
            }

            // If we reach here, result should be final auth payload
            console.log('handleTotpVerification final result', result);
            if ((result as any)?.access_token && (result as any)?.user) {
                onVerificationSuccess((result as any).access_token, (result as any).user);
            } else {
                console.warn('handleTotpVerification did not receive final auth payload, skipping onVerificationSuccess', result);
                setLoading(false);
            }
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
            if ((result as any)?.access_token && (result as any)?.user) {
                onVerificationSuccess((result as any).access_token, (result as any).user);
            } else {
                console.error('Backup code verification did not return final auth payload', result);
                setError('Backup code verification failed to return authentication payload');
                setLoading(false);
            }
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
                <h2>{currentStep === 'webauthn' ? 'Face ID / Passkey Confirmation' : 'Two-Factor Authentication'}</h2>
                <p className="modal-subtitle">
                    {currentStep === 'webauthn'
                        ? 'Confirm with Face ID, Touch ID, Windows Hello, or your platform passkey.'
                        : 'Enter the 6-digit code from your authenticator app'}
                </p>

                {error && <div className="error-message">{error}</div>}

                {currentStep === 'webauthn' ? (
                    <div className="webauthn-status">
                        <div className="webauthn-spinner" aria-hidden="true" />
                        <p>Waiting for your device confirmation...</p>
                    </div>
                ) : !useBackupCode ? (
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
