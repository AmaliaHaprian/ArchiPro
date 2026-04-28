import type { Project } from "../models/Project";
import './ProjectRow.css'

interface ProjectRowProps {
    project: Project
    onClick: () => void
}

function getCookieValue(key: string, defaultValue: string) {
    const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, c) => {
        const [k, v] = c.trim().split('=');
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
    }, {});
    return cookies[key] || defaultValue;
}
const theme = getCookieValue('theme', 'light');

function ProjectRow({ project, onClick }: ProjectRowProps) {
    
    return (
        // <div className={theme === 'light' ? 'light' : 'dark'}>
            <div className="project-row" data-project-id={project.id}>
                <span className="project-cell">{project.title}</span>
                <span className="project-cell">{project.status}</span>
                <span className="project-cell">{project.category}</span>
                <span className="project-cell">{project.progress}%</span>
                <button
                className="folder-action" 
                aria-label={`Open ${project.title}`} 
                onClick={onClick}
                />
            </div>
        // </div>
    )
};

export default ProjectRow;