import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './RegisterForm.css';
import type { User } from '../models/User';

function RegisterForm({onRegisterUser}: { onRegisterUser: (user: User) => void }) {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: ''
    });
    
    const validateForm = () => {
        let valid = true;
        const newErrors = {
            username: '',
            email: '',
            password: ''
        };
        if (!username.trim()) {
            newErrors.username = 'Username is required.';
            valid = false;
        }
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

    const handleRegister = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (validateForm()) {
            // Here you would typically send the registration data to your backend
            const newUser: User = {
                id: Date.now().toString(),
                username,
                email,
                password
            };
            onRegisterUser(newUser);
            console.log('Registered with:', newUser);
            navigate('/overview'); // Redirect to overview after successful registration
        }
    };

    return (
        <div className="register-form">
            <h2>Create an account</h2>
            <p>Sign up to start creating</p>
            <form onSubmit={handleRegister}>
                
                    <input
                        placeholder="Username"
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {errors.username && <span className="error">{errors.username}</span>}
                    <input
                        placeholder="Email"
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <span className="error">{errors.email}</span>}
                
                    <input
                        placeholder="Password"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <span className="error">{errors.password}</span>}
                
                <button type="submit">Register</button>
            </form>
            <p className="login-link">
                Already have an account? <span onClick={() => navigate('/login')}>LOGIN</span>
            </p>
        </div>
    );
}

export default RegisterForm;
