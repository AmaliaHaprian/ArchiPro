import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './LoginForm.css';

function LoginForm({ onLoginUser }: { onLoginUser: (username: string, password: string) => void }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });
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

    const handleLogin = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (validateForm()) {
            // Here you would typically send the login data to your backend
            console.log('Logging in with:', { email, password });
            onLoginUser(email, password);
            navigate('/overview'); // Redirect to overview after successful login
        }
    };
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
            </form>
        </div>
    );
}

export default LoginForm;