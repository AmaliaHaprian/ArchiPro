import './SideBarStages.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sidebarIcon from '../assets/sidebar.png';

interface SideBarStagesProps {
    stages: string[];
    currentStage: string;
    onStageChange: (stage: string) => void;
    projectId?: string;
}

function SideBarStages({ stages, currentStage, onStageChange, projectId }: SideBarStagesProps) {
    const [showSidebar, setShowSidebar] = useState(true);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setShowSidebar((prev) => !prev);
    };

    const handleStageClick = (stage: string) => {
        onStageChange(stage);
        if (projectId) {
            navigate(`/project/${projectId}/visualize?stage=${encodeURIComponent(stage)}`);
        }
    };

    return (
        <aside className={showSidebar ? 'sidebar-stages' : 'sidebar-stages hidden'}>
            <img
                onClick={toggleSidebar}
                className="sidebar-toggle-img"
                src={sidebarIcon}
                alt="Toggle Sidebar"
            />
            {showSidebar && (
                <ul className="stages-menu">
                    {stages.map((stage) => (
                        <li
                            key={stage}
                            className={currentStage === stage ? 'active' : ''}
                            onClick={() => handleStageClick(stage)}
                        >
                            {stage}
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
}

export default SideBarStages;
