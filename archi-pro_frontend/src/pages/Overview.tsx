import { useState } from "react";
import { getCookieValue } from '../utils/cookies';
import { useNavigate } from 'react-router-dom';
import type { Project } from "../models/Project";
import './Overview.css'
import { useUserPreferences } from '../hooks/useUserPreferences';
import ThemeSwitcher from "../components/ThemeSwitcher";
import { useEffect } from "react";
import { filterAndSearchProjects } from "../api";
import { startFakeDataGeneration, stopFakeDataGeneration } from "../api";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../api";
import PaginatedProjectsTable from "../components/PaginatedProjectsTable";
import StatisticsPage from "./StatisticsPage";
import InfiniteProjects from "../components/InfiniteProjects";

const socket = io(`${API_BASE_URL}/`, {
        transports: ['websocket', 'polling'],
    });

function Overview() {

    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => getCookieValue('theme', 'light'));
    const [viewMode, setViewMode] = useState<'table' | 'charts'>('table');
    const [spamProjects, setSpamProjects] = useState<string>('Start');
    const [currentUser, setCurrentUser] = useState<{ username: string; userId: string } | null>(null);
    const [chartsRefreshKey, setChartsRefreshKey] = useState(0);

    useUserPreferences(
        { theme },
        loaded => {
            if (loaded.theme && loaded.theme !== theme) setTheme(loaded.theme);
        }
    );

    const handleAddProject = () => {
        navigate('/addproject');
    }

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUser({ username: user.username, userId: user.userId });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setCurrentUser(null);
        navigate('/login');
    }

    useEffect(() => {
        try {
            socket.on('connect_error', (err) => {
                console.warn('Socket.IO connection error:', err);
            });
            socket.on('projectsAdded', () => {
                console.log('Received projectsAdded event');
                setChartsRefreshKey((prev) => prev + 1);
            });
        } catch (err) {
            console.warn('Socket.IO failed to initialize:', err);
        }
        return () => {
            socket?.off('connect_error');
            socket?.off('projectsAdded');
        };
    }, []);


    const handleSpamProjects = () => {
        if (spamProjects === 'Start') {
            setSpamProjects('Stop');
            startFakeDataGeneration(currentUser?.userId || '');
        } else {
            setSpamProjects('Start');
            stopFakeDataGeneration();
        }
    }

    return (
        <>
        <div className={theme==='light'? 'overview-light': 'overview-dark'}>
        <div className="overview">
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
            <div className="projects-header">
                <h2>ArchiPro</h2>
                <div className="header-right">
                    {currentUser && (
                        <div className="user-profile">
                            <div className="user-avatar">
                                {currentUser.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="user-name">{currentUser.username}</span>
                            <button className="logout-button" onClick={handleLogout} type="button">
                                Logout
                            </button>
                        </div>
                    )}
                    <button className="new-project-button" onClick={handleAddProject} type="button">+ New Project</button>
                </div>
            </div>

            <hr className="header-divider" />

            <main className="projects-main">
                <div className="projects-main-header">
                    <div className="main-title-block">
                        <h1>Projects</h1>
                        <p>Manage and track your architecture projects. All in one place</p>
                    </div>
                    <div className="header-buttons">
                        <button className='spam-projects-button'
                            onClick={handleSpamProjects}
                            type="button"
                        >
                            {spamProjects}
                        </button>
                        <button 
                            className={`view-toggle-button ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            type="button"
                        >
                            Table View
                        </button>
                        <button 
                            className={`view-toggle-button ${viewMode === 'charts' ? 'active' : ''}`}
                            onClick={() => setViewMode('charts')}
                            type="button"
                        >
                            Charts View
                        </button>
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <>
                        {/* <PaginatedProjectsTable chartsRefreshKey={chartsRefreshKey} />  */}
                        <InfiniteProjects chartsRefreshKey={chartsRefreshKey} />
                    </>
                ) : (
                    <StatisticsPage chartsRefreshKey={chartsRefreshKey} />
                )}
            </main>
        </div>
        </div>
        
        </>
    )
};

export default Overview;