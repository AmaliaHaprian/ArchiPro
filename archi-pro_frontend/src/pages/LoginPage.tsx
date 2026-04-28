import LoginForm from "../components/LoginForm";
import './LoginPage.css';
import login_img from '../assets/login_img.jpg';
function LoginPage({onLoginUser}: {onLoginUser: (username: string, password: string) => void}) {
    return (
        <div className="login-page">
            <img src={login_img} alt="Login" className="login-image" />
            <LoginForm onLoginUser={onLoginUser} />
        </div>
    );
}
export default LoginPage;