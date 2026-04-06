import type { Project } from '../models/Project';
import EditForm from '../components/EditForm';
import { useParams } from 'react-router-dom';
import './EditPage.css';

function EditPage({ projects, onUpdateProject }: { projects: Project[]; onUpdateProject: (updatedProject: Project) => void }) {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return <p>Project not found. Please go back to the projects list and select a project to edit.</p>;
  }

  return (
    <div className="edit-page">
      <h1 className='edit-titl'>Edit Project</h1>
      <EditForm project={project} onUpdateProject={onUpdateProject} />
    </div>
  );
}

export default EditPage;