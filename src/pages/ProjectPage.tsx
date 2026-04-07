import SideBar from "../components/SideBar";
import ProjectTopContainer from "../components/ProjectTopContainer";
import type { Project } from "../models/Project";
import { useParams } from 'react-router-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './ProjectPage.css';
import { useProjectTimeTracking } from '../hooks/useProjectTimeTracking';
import { getProjectTimeSpent, formatTimeSpent, stopTimeTracking } from '../utils/timeTracking';
import { useEffect, useState } from 'react';

type LocationState = {
        project: Project;
    }

function ProjectPage({ projects, onDeleteProject, onUpdateProject }: { projects: Project[]; onDeleteProject: (projectId: string) => void; onUpdateProject?: (project: Project) => void; }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const project = projects.find((p) => p.id === id);
    const [timeSpent, setTimeSpent] = useState<number>(0);
    
    // Track time automatically while on this page
    useProjectTimeTracking(id);
    
    // Update working hours only when leaving the page
    useEffect(() => {
        return () => {
            if (id && onUpdateProject) {
                stopTimeTracking(id);
                
                // Get the current project from the projects array
                const currentProject = projects.find(p => p.id === id);
                if (currentProject) {
                    const totalSeconds = getProjectTimeSpent(id);
                    const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
                    
                    onUpdateProject({
                        ...currentProject,
                        projectWorkingHours: (currentProject.projectWorkingHours || 0) + totalHours
                    });
                }
            }
        };
    }, [id]); // Only depend on id change
    
    // Update displayed time every second
    useEffect(() => {
        const interval = setInterval(() => {
            if (id) {
                setTimeSpent(getProjectTimeSpent(id));
            }
        }, 1000);
        
        return () => clearInterval(interval);
    }, [id]);

    if (!project) {
        return (
            <div className="project-page">
                <SideBar />
                <main>
                    <p>Project not found. Open it from the projects list.</p>
                    <Link to="/overview">Back to projects</Link>
                </main>
            </div>
        );
    }

    const handleDeleteProject = () => {
        onDeleteProject(project.id);
        navigate('/overview');
    };

    return (
        <div className="project-page">
            <SideBar projectId={project.id} />
            <main className="project-main">
                <Link to="/overview" className="back-to-projects">
                    Back to projects
                </Link>
                <ProjectTopContainer project={project} onDeleteProject={handleDeleteProject} />

                <section className="project-main-grid">
                    <article className='description-area'>
                        <h2>Description</h2>
                        <p>{project.projectDescription}</p>
                        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                            <strong>Working Hours:</strong> {project.projectWorkingHours || 0} hours
                            <br />
                            <small style={{ color: '#666' }}>Current session: {formatTimeSpent(timeSpent)}</small>
                        </div>
                    </article>

                    <aside className="right-panel">
                        <button className="import-button">Import</button>
                        <div className="to-do-panel">TO DO</div>
                        <div className="notes-panel">Notes</div>
                    </aside>
                </section>
                <footer className="project-footer">
                    <p>Created: {project.projectCreatedAt} </p>
                    <p>Last modified: {project.projectUpdatedAt} </p>
                </footer>
            </main>
        </div>
    );
}

export default ProjectPage;