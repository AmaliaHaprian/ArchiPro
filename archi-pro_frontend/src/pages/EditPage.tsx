import type { Project } from '../models/Project';
import EditForm from '../components/EditForm';
import { useParams } from 'react-router-dom';
import './EditPage.css';
import { fetchProjectById } from '../api';
import { useEffect, useState } from 'react';
function EditPage({ projects, onUpdateProject }: { projects: Project[]; onUpdateProject: (updatedProject: Project) => void }) {
  const { id } = useParams();
  const [project, setProject] = useState<Project>();

  useEffect(() => {
    const fetchProject = async () => {
      if (id) {
        try {
          const result = await fetchProjectById(id);
          setProject(result);
        } catch (error) {
          console.error('Error fetching project:', error);
        }
      }
    };
    fetchProject();
  }, [id]);

  return (
    <div className="edit-page">
      <h1 className='edit-titl'>Edit Project</h1>
      {project && <EditForm project={project} onUpdateProject={onUpdateProject} />}
    </div>
  );
}

export default EditPage;