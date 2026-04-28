import RegisterForm from "../components/RegisterForm";
import './RegisterPage.css';
import type { User } from '../models/User';

function RegisterPage({ onRegisterUser }: { onRegisterUser: (user: User) => void }) {
    return (
        <div className="register-page">
            <RegisterForm onRegisterUser={onRegisterUser} />
        </div>
    );
}

export default RegisterPage;