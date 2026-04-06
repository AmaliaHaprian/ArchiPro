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
                <span className="project-cell">{project.projectName}</span>
                <span className="project-cell">{project.projectStatus}</span>
                <span className="project-cell">{project.projectCategory}</span>
                <span className="project-cell">{project.projectProgres}%</span>
                <button
                className="folder-action" 
                aria-label={`Open ${project.projectName}`} 
                onClick={onClick}
                />
            </div>
        // </div>
    )
};

export default ProjectRow;