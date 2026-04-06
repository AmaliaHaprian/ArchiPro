
import './Hero.css'
import { useNavigate } from 'react-router-dom';
function Hero(){
    const navigate = useNavigate();

     const handleSignUp = () => {
        navigate('/register');
    }
    return (
        <div className="hero">
            <button className='signup-button' onClick={handleSignUp}>Sign Up</button>
            <button className='discover-button'>Discover</button>
        </div>
    )
}

export default Hero;