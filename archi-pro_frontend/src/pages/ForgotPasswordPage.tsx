import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '../api';

function ForgotPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') ?? '';

    const [email, setEmail] = useState(searchParams.get('email') ?? '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resetLink, setResetLink] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestReset = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await requestPasswordReset(email);
            setMessage(response.message);
            setResetLink(response.resetUrl ?? '');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Failed to request password reset');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!token) {
            setError('Reset token is missing. Open the reset link from your email or generated link.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const response = await resetPassword(token, newPassword);
            setMessage(response.message);
            setTimeout(() => navigate('/login'), 1200);
        } catch (resetError) {
            setError(resetError instanceof Error ? resetError.message : 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>{token ? 'Set a new password' : 'Forgot Password'}</h1>
                <p>
                    {token
                        ? 'Choose a new password for your account.'
                        : 'Enter your email and we will generate a password reset link.'}
                </p>

                {!token ? (
                    <form onSubmit={handleRequestReset}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Generating...' : 'Send reset link'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Update password'}
                        </button>
                    </form>
                )}

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}

                {resetLink && !token && (
                    <div>
                        <p>Development reset link:</p>
                        <a href={resetLink}>{resetLink}</a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForgotPasswordPage;