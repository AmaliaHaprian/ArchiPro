import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import './LoginForm.css';
import { loginUser } from "../api";
import { AuthContext } from "./AuthContext";
import TotpVerificationModal from "./TotpVerificationModal";
import type { AuthPayload, MfaRequiredPayload } from "../models/User";

function LoginForm({ onLoginUser }: { onLoginUser: (username: string, password: string) => void }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaType, setMfaType] = useState<'totp' | 'webauthn'>('totp');
    const [mfaToken, setMfaToken] = useState('');
    const [webauthnOptions, setWebauthnOptions] = useState<Record<string, unknown> | undefined>(undefined);
    const auth = useContext(AuthContext);
    if (!auth) {
        throw new Error('AuthContext is not available');
    }

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    }
    const validateForm = () => {
        let valid = true;
        const newErrors = {
            email: '',
            password: ''
        };
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid.';
            valid = false;
        }
        if (!password) {
            newErrors.password = 'Password is required.';
            valid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (validateForm()) {
            try {
                console.log('Logging in with:', { email, password });
                const payload  = await loginUser(email, password);

                console.log('Login response:', payload);
                
                // Check if MFA is required
                if ('mfa_required' in payload && payload.mfa_required) {
                    const mfaPayload = payload as MfaRequiredPayload;
                    setMfaToken(mfaPayload.mfa_token);
                    setMfaType(mfaPayload.mfa_type);
                    setWebauthnOptions(mfaPayload.webauthn_options);
                    setMfaRequired(true);
                } else {
                    const authPayload = payload as AuthPayload;
                    // No MFA required, direct login
                    auth.login(authPayload.access_token, authPayload.user);
                    onLoginUser(email, password);
                    navigate('/overview');
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Login failed.';
                setErrors(prev => ({ ...prev, email: message }));
            }
        }
    };

    const handleMfaVerificationSuccess = (token: string, user: any) => {
        if (token && user) {
            auth.login(token, user);
            onLoginUser(email, password);
            setMfaRequired(false);
            navigate('/overview');
        } else {
            console.error('handleMfaVerificationSuccess called without token/user', { token, user });
            setMfaRequired(false);
            setErrors(prev => ({ ...prev, email: 'MFA verification did not return authentication payload' }));
        }
    };

    const handleMfaVerificationError = (error: string) => {
        console.error('MFA verification error:', error);
    };

    if (mfaRequired && mfaToken) {
        return (
            <TotpVerificationModal
                mfaToken={mfaToken}
                mfaType={mfaType}
                webauthnOptions={webauthnOptions}
                onVerificationSuccess={handleMfaVerificationSuccess}
                onVerificationError={handleMfaVerificationError}
            />
        );
    }

    return (
        <div className="login-form">
            <h2>Login</h2>
            <p className="register-link">
                Don't have an account? <span onClick={() => navigate('/register')}>REGISTER</span>
            </p>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <input
                        placeholder="Email"
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <span className="error">{errors.email}</span>}
                
                </div>

                <div className="form-group">    
                    <input
                        placeholder="Password"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <span className="error">{errors.password}</span>}
                </div>
                <button type="submit">Login</button>
                <p className="forgot-password-link">
                    <span onClick={handleForgotPassword}>Forgot Password?</span>
                </p>
            </form>
        </div>
    );
}

export default LoginForm;