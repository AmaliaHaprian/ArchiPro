import './SideBar.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sidebarIcon from '../assets/sidebar.png';

interface SideBarProps {
    projectId?: string;
}

const STAGES = ['Project brief', 'Site analysis', 'Research', 'Design', 'Visualize'];

function SideBar({ projectId }: SideBarProps) {
    const [showSidebar, setShowSidebar] = useState(true);
    const navigate = useNavigate();
    
    const toggleSidebar = () => {
        setShowSidebar((prev) => !prev);
    }

    const handleStageClick = (stage: string) => {
        if (!projectId) return;
        
        if (stage === 'Project brief') {
            navigate(`/project/${projectId}`);
        } else if (stage === 'Site analysis') {
            navigate(`/project/${projectId}/site-analysis`);
        } else if (stage === 'Research') {
            navigate(`/project/${projectId}/research`);
        } else if (stage === 'Design') {
            navigate(`/project/${projectId}/design`);
        }
        // Other stages can be added later
    }

    return (
        <aside className={showSidebar ? 'sidebar' : 'hidden-sidebar'}>       
            <img onClick={toggleSidebar} className="sidebar-toggle-img" src={sidebarIcon} alt="Toggle Sidebar"></img>
            {showSidebar && (
            <ul className="sidebar-menu">
                {STAGES.map((stage) => (
                    <li key={stage} onClick={() => handleStageClick(stage)}>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                            {stage}
                        </a>
                    </li>
                ))}
            </ul>)}
        </aside>
    );
}
export default SideBar;