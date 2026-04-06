import SideBar from "../components/SideBar";
import ProjectTopContainer from "../components/ProjectTopContainer";
import type { Project } from "../models/Project";
import { useParams } from 'react-router-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './ProjectPage.css';

type LocationState = {
        project: Project;
    }

function ProjectPage({ projects, onDeleteProject }: { projects: Project[]; onDeleteProject: (projectId: string) => void; }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const project = projects.find((p) => p.id === id);

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