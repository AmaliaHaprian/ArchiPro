import type { Project } from '../models/Project';
import { useNavigate, useParams } from 'react-router-dom';

function ShadowPath({projects} : {projects: Project[]}) {
    const { projectId } = useParams<{ projectId: string }>();
    const project = projects.find(p => p.id === projectId);
    const navigate = useNavigate();

    if (!project) {
        return <div className="shadow-path-page">Project not found</div>;
    }

    return (
        <div className="shadow-path-page">
            <p onClick={() => navigate(`/project/${projectId}/design`)}>Back to design</p>
            <aside className="shadow-path-sidebar">
                <h3>Enter coordinates</h3>
                <input type="text" placeholder="Latitude" />
                <input type="text" placeholder="Longitude" />
                <input type="file">Upload render</input>
                <button>Calculate shadow path</button>
            </aside>
        </div>
    )
}

export default ShadowPath;